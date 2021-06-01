import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import * as smaregi from '../../functions/smaregi';

const db = admin.firestore();

export default functions.https.onCall(async (data, context) => {
  return await smaregi.storeList(db, data, context);
});
