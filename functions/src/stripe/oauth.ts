import * as functions from 'firebase-functions';
import * as utils from '../lib/utils'

export const connect = async (db: FirebaseFirestore.Firestore, data: any, context: functions.https.CallableContext) => {
  const uid = utils.validate_auth(context);
  const stripe = utils.get_stripe();

  const { code } = data
  utils.validate_params({ code })

  try {
    const refStripe = db.doc(`/admins/${uid}/system/stripe`)

    // Detect the case where this function was called again with same code twice
    const stripeInfo = (await refStripe.get()).data();
    if (stripeInfo && stripeInfo.code === code) {
      return { result: true, duplicate: true }
    }

    const response = await stripe.oauth.token({
      grant_type: 'authorization_code',
      code: code
    });

    const batch = db.batch()
    batch.set(
      refStripe,
      { auth: response, code },
    )
    batch.update(
      db.doc(`/admins/${uid}/public/payment`), {
      stripe: response.stripe_user_id
    })
    await batch.commit()
    return { result: true }
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
    const refPayment = db.doc(`/admins/${uid}/public/payment`);
    const payment = (await refPayment.get()).data();
    const stripe_user_id = payment?.stripe
    if (!stripe_user_id) {
      throw new functions.https.HttpsError('invalid-argument', 'This account is not connected to Stripe.')
    }

    // We remove it from the database first, so that the operator can attempt to re-connect
    // if something goes wrong.
    await refPayment.update({
      stripe: null
    });

    await db.doc(`/admins/${uid}/system/stripe`).delete();

    const response = await stripe.oauth.deauthorize({
      client_id: STRIPE_CLIENT_ID,
      stripe_user_id: stripe_user_id,
    });

    return { result: response }
  } catch (error) {
    throw utils.process_error(error)
  }
};

export const verify = async (db: FirebaseFirestore.Firestore, data: any, context: functions.https.CallableContext) => {
  if (!context.auth?.token?.admin) {
    throw new functions.https.HttpsError('permission-denied', 'You do not have permission to confirm this request.')
  }
  const stripe = utils.get_stripe();

  const { account_id } = data;
  utils.validate_params({ account_id })
  try {
    const account = await stripe.accounts.retrieve(account_id)
    return { result: true, account }
  } catch (error) {
    throw utils.process_error(error)
  }
};
