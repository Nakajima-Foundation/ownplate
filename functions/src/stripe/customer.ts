import * as functions from 'firebase-functions'
import * as utils from '../lib/utils'

export const createCustomer = async (db: FirebaseFirestore.Firestore, uid: string, phoneNumber: string) => {
  const stripe = utils.get_stripe();
  await db.runTransaction(async (tr) => {
    const refStripe = db.doc(`/users/${uid}/system/stripe`)
    const stripeInfo = (await tr.get(refStripe)).data();

    // Create a stripe customer if we haven't created yet
    if (!stripeInfo) {
      const customer = await stripe.customers.create({
        description: phoneNumber,
        metadata: { uid, phoneNumber }
      })
      tr.set(refStripe, {
        customerId: customer.id
      })
    }
  });
}

export const update = async (db: FirebaseFirestore.Firestore, data: any, context: functions.https.CallableContext) => {
  const uid = utils.validate_auth(context);
  const { token } = data;
  utils.validate_params({ token });
  const stripe = utils.get_stripe();

  const refStripe = db.doc(`/users/${uid}/system/stripe`)

  const result = { result: {} }
  try {
    await db.runTransaction(async (tr) => {
      const stripeInfo = (await tr.get(refStripe)).data();
      if (!stripeInfo) {
        throw new functions.https.HttpsError('invalid-argument', 'This user does not have a stripe customer.')
      }

      result.result = await stripe.customers.update(stripeInfo.customerId, {
        source: token
      })
    });

    return result
  } catch (error) {
    throw utils.process_error(error)
  }

}
