import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe'

export const connect = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.')
  }
  const STRIPE_API_KEY = functions.config().stripe.api_key
  if (!STRIPE_API_KEY) {
    throw new functions.https.HttpsError('invalid-argument', 'The functions requires STRIPE_API_KEY.')
  }
  const code = data.code
  if (!code) {
    throw new functions.https.HttpsError('invalid-argument', 'This request does not include an code.')
  }
  const uid: string = context.auth.uid
  const stripe = new Stripe(STRIPE_API_KEY, { apiVersion: '2020-03-02' })
  try {
    const response = await stripe.oauth.token({
      grant_type: 'authorization_code',
      code: code
    });

    const batch = admin.firestore().batch()

    batch.set(
      admin.firestore().collection('admins').doc(uid)
        .collection('system').doc('stripe'),
      response
    )
    batch.set(
      admin.firestore().collection('admins').doc(uid)
        .collection('public').doc('stripe'),
      {
        isConnected: true
      }
    )

    await batch.commit()
    return { result: response }
  } catch (error) {
    console.error(error)
    return { error }
  }
});

