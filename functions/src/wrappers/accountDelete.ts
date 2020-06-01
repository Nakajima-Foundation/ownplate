import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import * as Account from '../functions/account';

const db = admin.firestore();

export default functions.https.onCall(async (data, context) => {
  return await Account.deleteAccount(db, data, context);
});
