import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import * as Order from '../../functions/order';

const db = admin.firestore();

export default functions.https.onCall(async (data, context) => {
  return await Order.place(db, data, context);
});
