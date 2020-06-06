// import * as admin from 'firebase-admin';

const accountIdToUID = (accountId) => {
  const uid = "123";
  return uid;
};

export const account_updated = async (db, event) => {
  const {data: {object} } = event;
  const { id } = object;
  console.log(id);
  const uid = accountIdToUID(id);

  await callbackLog(db, uid, stripeActions.account_updated, event);

  return {}
}

export const capability_updated = async (db, event) => {
  const {data: {object} } = event;
  const { account } = object;
  console.log(account);

  // todo
  const uid = accountIdToUID(account);
  // log
  await callbackLog(db, uid, stripeActions.capability_updated, event);
  return {};
}

export const stripeActions = {
  capability_updated: 1,
  account_updated: 2,
};

export const callbackLog = async (db, userId, action, log) => {
  const payload = { data: {log: log.data.object, userId }, action, type: "callback" };
  await storeAdminLog(db, userId, payload);
  // console.log(JSON.stringify(log, undefined, 1));
}

const storeAdminLog = async (db, adminUID, payload) => {
  // payload.created = admin.firestore.Timestamp.now();
  console.log(payload);
  // await db.collection(`/admins/${adminUID}/stripeLogs`).add(payload);
}
