import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import * as Line from '../functions/line';

const db = admin.firestore();

export default functions.https.onCall(async (data, context) => {
  return await Line.authenticate(db, data, context);
});
