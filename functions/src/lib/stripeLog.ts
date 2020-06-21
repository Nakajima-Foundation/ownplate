import * as admin from 'firebase-admin';

const accountIdToUIDs = async (db, accountId) => {
  const pubSnapshot = await db.collectionGroup("public").where("stripe", "==", accountId).get();
  return (pubSnapshot?.docs || []).map(doc => {
    const uid = pubSnapshot.docs[0].ref.parent.parent.id;
    return uid;
  });
};

export const account_updated = async (db, event) => {
  const {data: {object} } = event;
  const { id } = object;
  const uids = await accountIdToUIDs(db, id);

  await callbackAdminLog(db, uids, stripeActions.account_updated, event);

  return {}
}

export const capability_updated = async (db, event) => {
  const {data: {object} } = event;
  const { account } = object;
  console.log(account);
  const uids = await accountIdToUIDs(db, account);
  // log
  await callbackAdminLog(db, uids, stripeActions.capability_updated, event);
  return {};
}

export const account_authorized = async (db, event) => {
  const uids = ["unknown"];
  await callbackAdminLog(db, uids, stripeActions.account_authorized, event);
  return {};
}

export const account_deauthorized = async (db, event) => {
  const uids = ["unknown"];
  await callbackAdminLog(db, uids, stripeActions.account_deauthorized, event);
  return {};
}


export const unknown_log = async (db, event) => {
  const uids = ["unknown"];
  await callbackAdminLog(db, uids, stripeActions.unknow, event);
  return {};
}


export const stripeActions = {
  capability_updated: 1,
  account_updated: 2,
  account_authorized: 3,
  account_deauthorized: 4,
  unknow: 1000,
};

export const callbackAdminLog = async (db, uids, action, log) => {
  await Promise.all((uids.length > 0 ? uids : ['unknown']).map(async (uid) => {
    console.log(uid, action)
    const payload: any = {
      data: {log: log.data.object },
      action,
      uid,
      type: "callback",
      created: (process.env.NODE_ENV !== "test") ?  admin.firestore.Timestamp.now() : Date.now()
    };
    await db.collection(`/admins/${uid}/stripeLogs`).add(payload);
  }));
}
