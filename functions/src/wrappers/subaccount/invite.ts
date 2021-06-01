import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import { invite } from '../../functions/subAccount';

const db = admin.firestore();

export default functions.https.onCall(async (data, context) => {
  return await invite(db, data, context);
});
