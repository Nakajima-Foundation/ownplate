import * as functions from 'firebase-functions';
import * as utils from './utils'

export const connect = async (db: FirebaseFirestore.Firestore, data: any, context: functions.https.CallableContext) => {
  const uid = utils.validate_auth(context);
  const stripe = utils.get_stripe();

  const { code } = data
  utils.validate_params({ code })

  try {
    const response = await stripe.oauth.token({
      grant_type: 'authorization_code',
      code: code
    });

    const batch = db.batch()
    batch.set(
      db.doc(`/admins/${uid}/system/stripe`),
      response
    )
    batch.set(
      db.doc(`/admins/${uid}/public/stripe`),
      {
        isConnected: true,
        stripeAccount: response.stripe_user_id
      }
    )

    await batch.commit()
    return { result: response }
  } catch (error) {
    throw utils.process_error(error)
  }
};

export const disconnect = async (db: FirebaseFirestore.Firestore, data: any, context: functions.https.CallableContext) => {
  const uid = utils.validate_auth(context);
  const stripe = utils.get_stripe();

  const { STRIPE_CLIENT_ID } = data;
  utils.validate_params({ STRIPE_CLIENT_ID })

  try {
    const snapshot = await db.doc(`/admins/${uid}/system/stripe`).get()
    const systemStripe = snapshot.data()
    if (!systemStripe) {
      throw new functions.https.HttpsError('invalid-argument', 'This account is not connected to Stripe.')
    }
    const stripe_user_id = systemStripe.stripe_user_id
    if (!systemStripe.stripe_user_id) {
      throw new functions.https.HttpsError('invalid-argument', 'This account is not connected to Stripe.')
    }

    // We remove it from the database first, so that the operator can attempt to re-connect
    // if something goes wrong.
    const batch = db.batch()
    batch.delete(
      db.doc(`/admins/${uid}/system/stripe`)
    )
    batch.set(
      db.doc(`/admins/${uid}/public/stripe`),
      {
        isConnected: false,
        stripeAccount: null
      }
    )
    await batch.commit()

    const response = await stripe.oauth.deauthorize({
      client_id: STRIPE_CLIENT_ID,
      stripe_user_id: stripe_user_id,
    });

    return { result: response }
  } catch (error) {
    throw utils.process_error(error)
  }
};
