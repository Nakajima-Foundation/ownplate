import * as functions from 'firebase-functions';
import * as utils from '../lib/utils'

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
    batch.update(
      db.doc(`/admins/${uid}/public/payment`), {
      stripe: response.stripe_user_id
    })
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
    // We remove it from the database first, so that the operator can attempt to re-connect
    // if something goes wrong.
    await db.doc(`/admins/${uid}/public/payment`).update({
      stripe: null
    });

    const refStripe = db.doc(`/admins/${uid}/system/stripe`);
    const snapshot = await refStripe.get()
    const systemStripe = snapshot.data()
    if (!systemStripe) {
      throw new functions.https.HttpsError('invalid-argument', 'This account is not connected to Stripe.')
    }
    const stripe_user_id = systemStripe.stripe_user_id
    if (!systemStripe.stripe_user_id) {
      throw new functions.https.HttpsError('invalid-argument', 'This account is not connected to Stripe.')
    }

    await refStripe.delete();

    const response = await stripe.oauth.deauthorize({
      client_id: STRIPE_CLIENT_ID,
      stripe_user_id: stripe_user_id,
    });

    return { result: response }
  } catch (error) {
    throw utils.process_error(error)
  }
};
