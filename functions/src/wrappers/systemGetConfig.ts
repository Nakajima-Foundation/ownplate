import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import * as System from '../functions/system';

const db = admin.firestore();

export default functions.https.onCall(async (data, context) => {
  return await System.getConfig(db, data, context);
});
