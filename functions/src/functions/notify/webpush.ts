import { Firestore } from "firebase-admin/firestore";
import { SendResponse, getMessaging } from "firebase-admin/messaging";

import { webPushVapidPublicKey } from "../../common/project";
import { INVALID_TARGET_CODES, MULTICAST_LIMIT, WebPushChild, chunk, notifyTargetUids } from "./webpushFormat";

export type WebPushResult = {
  sent: number;
  failed: number;
  targets: number;
};

export const registrationsCollection = (db: Firestore, uid: string) => {
  return db.collection("admins").doc(uid).collection("pushRegistrations");
};

// 鍵が無い環境では購読自体が発生しないので、Firestore を読む前に打ち切る
export const isWebPushConfigured = () => {
  return webPushVapidPublicKey.length > 0;
};

const getChildren = async (db: Firestore, ownerUid: string): Promise<WebPushChild[]> => {
  const children = await db.collection(`admins/${ownerUid}/children`).get();
  return children.docs.map((doc) => {
    const restaurantLists = doc.data().restaurantLists;
    return { uid: doc.id, restaurantLists: Array.isArray(restaurantLists) ? restaurantLists : [] };
  });
};

export const restaurantNotifyUids = async (db: Firestore, ownerUid: string, restaurantId: string) => {
  return notifyTargetUids(ownerUid, await getChildren(db, ownerUid), restaurantId);
};

// 端末は FID で識別し、それをそのまま doc id にしている
export const loadFids = async (db: Firestore, uid: string) => {
  const snapshot = await registrationsCollection(db, uid).get();
  return snapshot.docs.map((doc) => doc.id);
};

const pruneInvalidFids = async (db: Firestore, uid: string, fids: string[], responses: SendResponse[]) => {
  const invalid = fids.filter((_fid, index) => {
    const code = responses[index]?.error?.code;
    return code !== undefined && INVALID_TARGET_CODES.includes(code);
  });
  await Promise.all(invalid.map((fid) => registrationsCollection(db, uid).doc(fid).delete()));
};

const deliverBatch = async (db: Firestore, uid: string, data: Record<string, string>, fids: string[]) => {
  const response = await getMessaging().sendEachForMulticast({ fids, data });
  response.responses.forEach((result, index) => {
    if (!result.success) {
      console.error("webPush: delivery failed", { fid: fids[index], code: result.error?.code });
    }
  });
  await pruneInvalidFids(db, uid, fids, response.responses);
  return { sent: response.successCount, failed: response.failureCount };
};

// 500 宛先を超える分もまとめて配信する
const deliverToUid = async (db: Firestore, uid: string, data: Record<string, string>): Promise<WebPushResult> => {
  const fids = await loadFids(db, uid);
  if (fids.length === 0) {
    return { sent: 0, failed: 0, targets: 0 };
  }
  const batches = await Promise.all(chunk(fids, MULTICAST_LIMIT).map((batch) => deliverBatch(db, uid, data, batch)));
  return {
    sent: batches.reduce((total, batch) => total + batch.sent, 0),
    failed: batches.reduce((total, batch) => total + batch.failed, 0),
    targets: fids.length,
  };
};

export const sendWebPush = async (db: Firestore, uids: string[], data: Record<string, string>): Promise<WebPushResult> => {
  const results = await Promise.all(uids.map((uid) => deliverToUid(db, uid, data)));
  return {
    sent: results.reduce((total, result) => total + result.sent, 0),
    failed: results.reduce((total, result) => total + result.failed, 0),
    targets: results.reduce((total, result) => total + result.targets, 0),
  };
};
