import * as functions from 'firebase-functions'
import Stripe from 'stripe'

export const validate_auth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.')
  }
  return context.auth.uid
}

export const validate_stripe = () => {
  const STRIPE_SECRET_KEY = functions.config().stripe.secret_key
  if (!STRIPE_SECRET_KEY) {
    throw new functions.https.HttpsError('invalid-argument', 'The functions requires STRIPE_SECRET_KEY.')
  }
  return new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2020-03-02' })
}

export const validate_params = (params) => {
  const errors = Object.keys(params).filter(key => {
    return params[key] === undefined;
  })
  if (errors.length > 0) {
    throw new functions.https.HttpsError('invalid-argument',
      'Missing parameters.', { params: errors }
    )
  }
}
