import * as crypto from "crypto";
import * as admin from "firebase-admin";
import * as webpush from "web-push";
import { defineSecret } from "firebase-functions/params";

import { ownPlateConfig, webPushVapidPublicKey } from "../../common/project";
import { WebPushChild, notifyTargetUids } from "./webpushFormat";

const VAPID_PRIVATE_KEY = defineSecret("VAPID_PRIVATE_KEY");

// push サービスはこの2つで「この購読にはもう届かない」ことを示す
const EXPIRED_STATUS_CODES = [404, 410];

type StoredSubscription = {
  uid: string;
  subscriptionId: string;
  subscription: webpush.PushSubscription;
};

export const subscriptionCollectionPath = (uid: string) => {
  return `admins/${uid}/webPushSubscriptions`;
};

export const subscriptionIdOf = (endpoint: string) => {
  return crypto.createHash("sha256").update(endpoint).digest("hex");
};

export const isWebPushConfigured = () => {
  return webPushVapidPublicKey !== "";
};

const toPushSubscription = (data: admin.firestore.DocumentData): webpush.PushSubscription | null => {
  const { endpoint, keys } = data;
  if (typeof endpoint !== "string" || typeof keys?.p256dh !== "string" || typeof keys?.auth !== "string") {
    return null;
  }
  return { endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth } };
};

const getChildren = async (db: admin.firestore.Firestore, ownerUid: string): Promise<WebPushChild[]> => {
  const children = await db.collection(`admins/${ownerUid}/children`).get();
  return children.docs.map((doc) => {
    const restaurantLists = doc.data().restaurantLists;
    return { uid: doc.id, restaurantLists: Array.isArray(restaurantLists) ? restaurantLists : [] };
  });
};

export const restaurantNotifyUids = async (db: admin.firestore.Firestore, ownerUid: string, restaurantId: string) => {
  return notifyTargetUids(ownerUid, await getChildren(db, ownerUid), restaurantId);
};

const isStored = (stored: StoredSubscription | null): stored is StoredSubscription => {
  return stored !== null;
};

const getSubscriptions = async (db: admin.firestore.Firestore, uids: string[]): Promise<StoredSubscription[]> => {
  const perUid = await Promise.all(
    uids.map(async (uid) => {
      const snapshot = await db.collection(subscriptionCollectionPath(uid)).get();
      return snapshot.docs.map((doc) => {
        const subscription = toPushSubscription(doc.data());
        return subscription ? { uid, subscriptionId: doc.id, subscription } : null;
      });
    }),
  );
  return perUid.flat().filter(isStored);
};

const isExpired = (error: unknown) => {
  return error instanceof webpush.WebPushError && EXPIRED_STATUS_CODES.includes(error.statusCode);
};

const sendToSubscription = async (db: admin.firestore.Firestore, stored: StoredSubscription, payload: string) => {
  try {
    await webpush.sendNotification(stored.subscription, payload);
    return true;
  } catch (e) {
    if (isExpired(e)) {
      await db.doc(`${subscriptionCollectionPath(stored.uid)}/${stored.subscriptionId}`).delete();
      return false;
    }
    console.error("webPush: failed to send", e);
    return false;
  }
};

export const sendWebPush = async (db: admin.firestore.Firestore, uids: string[], payload: string) => {
  const privateKey = VAPID_PRIVATE_KEY.value();
  if (!isWebPushConfigured() || !privateKey) {
    console.warn("webPush: VAPID key is not configured");
    return { sent: 0, total: 0 };
  }
  webpush.setVapidDetails(`https://${ownPlateConfig.hostName}`, webPushVapidPublicKey, privateKey);

  const subscriptions = await getSubscriptions(db, uids);
  const results = await Promise.all(subscriptions.map((stored) => sendToSubscription(db, stored, payload)));
  return { sent: results.filter(Boolean).length, total: results.length };
};
