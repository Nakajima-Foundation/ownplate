import * as functions from 'firebase-functions'
import { stripe_regions, regionalSettings } from '../common/constant'
import Stripe from 'stripe'
import * as Sentry from '@sentry/node';

export const getRegion = () => {
  const locale = functions.config().locale;
  return (locale && locale.region) || "US";
}

export const getStripeRegion = () => {
  const region = getRegion();
  return stripe_regions[region] || stripe_regions["US"];
}

export const getRegionalSetting = () => {
  const region = getRegion();
  return regionalSettings[region] || regionalSettings["US"];
}

export const validate_auth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.')
  }
  return context.auth.uid
}

export const getStripeWebhookSecretKey = () => {
  return functions.config() && functions.config().stripe && functions.config().stripe.whsecret_key || process.env.WH_STRIPE_SECRET;
}
export const getStripeSecretKey = () => {
  return functions.config() && functions.config().stripe && functions.config().stripe.secret_key || process.env.STRIPE_SECRET;
}

export const get_stripe = () => {
  const STRIPE_SECRET_KEY = getStripeSecretKey();
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

export const get_restaurant = async (db: FirebaseFirestore.Firestore, restaurantId: String) => {
  const snapshot = await db.doc(`/restaurants/${restaurantId}`).get()
  const data = snapshot.data()
  if (!data) {
    throw new functions.https.HttpsError('invalid-argument', 'There is no restaurant with this id.')
  }
  return data;
}

export const process_error = (error: any) => {
  console.error(error)
  Sentry.captureException(error);
  if (error instanceof functions.https.HttpsError) {
    return error
  }
  return new functions.https.HttpsError("internal", error.message, error);
}
