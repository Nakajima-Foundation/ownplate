import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import * as StripeCustomer from '../..//stripe/customer'

const db = admin.firestore();

export default functions.https.onCall(async (data, context) => {
  return await StripeCustomer.update(db, data, context);
});
