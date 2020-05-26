import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import * as Trace from '../functions/trace';

const db = admin.firestore();

export default functions.https.onCall(async (data, context) => {
  return await Trace.process(db, data, context);
});
