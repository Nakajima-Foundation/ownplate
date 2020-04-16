import * as functions from 'firebase-functions';
import Stripe from 'stripe'
import Account from '../models/Account'

export const checkoutConfirm = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.')
  }
  const STRIPE_API_KEY = functions.config().stripe.api_key
  if (!STRIPE_API_KEY) {
    throw new functions.https.HttpsError('invalid-argument', 'The functions requires STRIPE_API_KEY.')
  }
  console.info(context)
  const code = data.code
  if (!code) {
    throw new functions.https.HttpsError('invalid-argument', 'This request does not include an code.')
  }
  const uid: string = context.auth.uid
  const stripe = new Stripe(STRIPE_API_KEY, { apiVersion: '2020-03-02' })
  const response = await stripe.oauth.token({
    grant_type: 'authorization_code',
    code: code
  });
  const account = new Account(uid)
  account.status = 'connected'
  account.stripeUserId = response.stripe_user_id
  account.stripeInfo = response
  await account.save()
});

