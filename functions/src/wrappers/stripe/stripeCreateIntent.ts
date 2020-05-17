import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import * as StripeIntent from '../../stripe/intent'

const db = admin.firestore();

export default functions.https.onCall(async (data, context) => {
  return await StripeIntent.create(db, data, context);
});
