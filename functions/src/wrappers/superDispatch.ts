import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import * as Super from '../functions/super';

const db = admin.firestore();

export default functions.https.onCall(async (data, context) => {
  return await Super.dispatch(db, data, context);
});
