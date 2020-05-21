import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import * as StripeOAuth from '../..//stripe/oauth'

const db = admin.firestore();

export default functions.https.onCall(async (data, context) => {
  return await StripeOAuth.disconnect(db, data, context);
});
