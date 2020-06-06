// import * as admin from 'firebase-admin';

export const account_updated = async (db, event) => {
  const {data: {object} } = event;
  const { id } = object;
  console.log(id);

  await callbackLog(db, userId, stripeActions.capability_updated, event);

  return {}
}

export const capability_updated = async (db, event) => {
  const {data: {object} } = event;
  const { account } = object;
  console.log(account);

  // todo
  const userId = "123";
  // log
  await callbackLog(db, userId, stripeActions.capability_updated, event);
  return {};
}

export const stripeActions = {
  capability_updated: 1,
  account_updated: 2,
};

export const callbackLog = async (db, userId, action, log) => {
  const payload = { data: {log, userId }, action, type: "callback" };
  await storeAdminLog(db, userId, payload);
  // console.log(JSON.stringify(log, undefined, 1));
}

const storeAdminLog = async (db, adminUID, payload) => {
  // payload.created = admin.firestore.Timestamp.now();
  console.log(payload);
  await db.collection(`/admins/${adminUID}/stripeLogs`).add(payload);
}
