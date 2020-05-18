import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import * as Order from '../../functions/order';

const db = admin.firestore();

export default functions.https.onCall(async (data, context) => {
  await Order.wasOrderCreated(db, data, context);
});
