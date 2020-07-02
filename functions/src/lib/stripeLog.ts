import * as admin from 'firebase-admin';
import * as utils from '../lib/utils'

const accountIdToUIDs = async (db, accountId) => {
  if (accountId) {
    // current
    const pubSnapshot = await db.collectionGroup("public").where("stripe", "==", accountId).get();
    if (!pubSnapshot.empty) {
      return pubSnapshot.docs.map(doc => {
        const uid = doc.ref.parent.parent.id;
        return uid;
      });
    }
    // ---- Backward compatibility
    const pubSnapshot2 = await db.collectionGroup("public").where("stripeAccount", "==", accountId).get();
    if (!pubSnapshot2.empty) {
      return pubSnapshot2.docs.map(doc => {
        const uid = doc.ref.parent.parent.id;
        return uid;
      });
    }
  }

  return [];
};

export const account_updated = async (db, event) => {
  const { data: { object } } = event;
  const { id } = object;
  const uids = await accountIdToUIDs(db, id);

  return await callbackAdminLog(db, uids, stripeActions.account_updated, event);
}

export const capability_updated = async (db, event) => {
  const { data: { object } } = event;
  const { account, status, id } = object;
  const uids = await accountIdToUIDs(db, account);

  const stripe = utils.get_stripe();
  if (status === "active" && id === "jcb_payments") {
    try {
      // Check if JCB payments are really active (paranoia)
      const accountInfo = await stripe.accounts.retrieve(account)
      const capabilities: any = accountInfo.capabilities;
      if (capabilities && capabilities.jcb_payments === "active") {
        await Promise.all(uids.map(async (uid: string) => {
          console.log("capability_updated: updating", uid, accountInfo)
          await db.doc(`admins/${uid}/public/payment`).update({
            stripeJCB: true
          });
        }));
      } else {
        console.error("capability_updated: no capabilities", capabilities)
      }
    } catch (error) {
      console.error("capability_updated: failed to retrieve account info", account)
    }

  }

  // log
  return await callbackAdminLog(db, uids, stripeActions.capability_updated, event);
}

export const account_authorized = async (db, event) => {
  const id = event.account;
  const uids = await accountIdToUIDs(db, id);
  return await callbackAdminLog(db, uids, stripeActions.account_authorized, event);
}

export const account_deauthorized = async (db, event) => {
  const id = event.account;
  const uids = await accountIdToUIDs(db, id);
  return await callbackAdminLog(db, uids, stripeActions.account_deauthorized, event);
}


export const unknown_log = async (db, event) => {
  const id = event.account || event.id;
  const uids = await accountIdToUIDs(db, id);
  return await callbackAdminLog(db, uids, stripeActions.unknow, event);
}


export const stripeActions = {
  capability_updated: 1,
  account_updated: 2,
  account_authorized: 3,
  account_deauthorized: 4,
  unknow: 1000,
};

export const callbackAdminLog = async (db, uids, action, log) => {
  return await Promise.all((uids.length > 0 ? uids : ['unknown']).map(async (uid) => {
    console.log(uid, action)
    const payload: any = {
      data: { log: log },
      action,
      uid,
      type: "callback",
      created: (process.env.NODE_ENV !== "test") ? admin.firestore.Timestamp.now() : Date.now()
    };
    await db.collection(`/admins/${uid}/stripeLogs`).add(payload);
    return payload;
  }));
}
