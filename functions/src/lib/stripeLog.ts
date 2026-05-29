import * as admin from "firebase-admin";
import * as utils from "../lib/utils";
import Stripe from "stripe";

const accountIdToUIDs = async (db: admin.firestore.Firestore, accountId: string) => {
  if (accountId) {
    // current
    const pubSnapshot = await db.collectionGroup("public").where("stripe", "==", accountId).get();
    if (!pubSnapshot.empty) {
      return pubSnapshot.docs.map((doc) => {
        const uid = doc.ref.parent?.parent?.id;
        return uid ?? "";
      });
    }
    // ---- Backward compatibility
    const pubSnapshot2 = await db.collectionGroup("public").where("stripeAccount", "==", accountId).get();
    if (!pubSnapshot2.empty) {
      return pubSnapshot2.docs.map((doc) => {
        const uid = doc.ref.parent?.parent?.id;
        return uid ?? "";
      });
    }
  }

  return [];
};

// Flip the public `stripeJCB` flag for every admin tied to the given Stripe
// connected account, after re-confirming with Stripe that JCB is really active.
// Shared by capability.updated and account.updated handlers — Stripe sends one
// or the other depending on the account / event, so both paths need this.
const activateJCBIfActive = async (
  db: admin.firestore.Firestore,
  uids: string[],
  accountId: string,
) => {
  if (uids.length === 0 || !accountId) {
    return;
  }
  const stripe = utils.get_stripe_v2();
  try {
    const accountInfo = await stripe.accounts.retrieve(accountId);
    const capabilities = accountInfo.capabilities as Record<string, string> | undefined;
    if (capabilities && capabilities.jcb_payments === "active") {
      await Promise.all(
        uids.map(async (uid: string) => {
          console.log("activateJCBIfActive: updating", uid);
          await db.doc(`admins/${uid}/public/payment`).update({
            stripeJCB: true,
          });
        }),
      );
    } else {
      console.error("activateJCBIfActive: jcb_payments not active in retrieved account", capabilities);
    }
  } catch (error) {
    console.error("activateJCBIfActive: failed to retrieve account info", accountId, error);
  }
};

export const account_updated = async (db: admin.firestore.Firestore, event: Stripe.Event) => {
  const {
    data: { object, previous_attributes },
  } = event;
  const id = ("id" in object ? object.id : "") as string;
  const uids = await accountIdToUIDs(db, id ?? "");

  // Stripe fires either capability.updated or account.updated when JCB flips
  // to "active". For Standard connect accounts (this codebase), it often comes
  // as account.updated with the change reflected in previous_attributes. Only
  // act on a real transition: `jcb_payments` must be present in
  // previous_attributes.capabilities AND currently "active".
  const previousCapabilities =
    (previous_attributes as { capabilities?: Record<string, string> } | undefined)?.capabilities;
  const currentCapabilities =
    ("capabilities" in object ? (object.capabilities as Record<string, string> | undefined) : undefined);
  if (
    previousCapabilities &&
    "jcb_payments" in previousCapabilities &&
    currentCapabilities?.jcb_payments === "active"
  ) {
    await activateJCBIfActive(db, uids, id);
  }

  return await callbackAdminLog(db, uids, stripeActions.account_updated, event);
};

export const capability_updated = async (db: admin.firestore.Firestore, event: Stripe.Event) => {
  const {
    data: { object },
  } = event;
  const account = ("account" in object ? object.account : "") as string;
  const status = ("status" in object ? object.status : "") as string;
  const id = ("id" in object ? object.id : "") as string;
  const uids = await accountIdToUIDs(db, account);

  if (status === "active" && id === "jcb_payments") {
    await activateJCBIfActive(db, uids, account);
  }

  // log
  return await callbackAdminLog(db, uids, stripeActions.capability_updated, event);
};

export const account_authorized = async (db: admin.firestore.Firestore, event: Stripe.Event) => {
  const id = event.account;
  const uids = await accountIdToUIDs(db, id ?? "");
  return await callbackAdminLog(db, uids, stripeActions.account_authorized, event);
};

export const account_deauthorized = async (db: admin.firestore.Firestore, event: Stripe.Event) => {
  const id = event.account;
  const uids = await accountIdToUIDs(db, id ?? "");
  return await callbackAdminLog(db, uids, stripeActions.account_deauthorized, event);
};

export const unknown_log = async (db: admin.firestore.Firestore, event: Stripe.Event) => {
  const id = event.account || event.id;
  const uids = await accountIdToUIDs(db, id);
  return await callbackAdminLog(db, uids, stripeActions.unknow, event);
};

export const stripeActions = {
  capability_updated: 1,
  account_updated: 2,
  account_authorized: 3,
  account_deauthorized: 4,
  unknow: 1000,
};

export const callbackAdminLog = async (db: admin.firestore.Firestore, uids: string[], action: number, log: Stripe.Event) => {
  return await Promise.all(
    (uids.length > 0 ? uids : ["unknown"]).map(async (uid) => {
      console.log(uid, action);
      const payload: {
        data: { log: Stripe.Event };
        action: number;
        uid: string;
        type: string;
        created: admin.firestore.Timestamp | number;
      } = {
        data: { log: log },
        action,
        uid,
        type: "callback",
        created: process.env.NODE_ENV !== "test" ? admin.firestore.Timestamp.now() : Date.now(),
      };
      await db.collection(`/admins/${uid}/stripeLogs`).add(payload);
      return payload;
    }),
  );
};
