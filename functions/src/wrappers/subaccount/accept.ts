import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import { accept } from '../../functions/subAccount';

const db = admin.firestore();

export default functions.https.onCall(async (data, context) => {
  return await accept(db, data, context);
});
