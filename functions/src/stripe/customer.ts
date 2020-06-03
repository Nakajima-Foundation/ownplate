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
  const { tokenId } = data;
  utils.validate_params({ tokenId });
  const stripe = utils.get_stripe();

  const refStripeSystem = db.doc(`/users/${uid}/system/stripe`)
  const refStripeReadOnly = db.doc(`/users/${uid}/readonly/stripe`)

  try {
    const token = await stripe.tokens.retrieve(tokenId);
    const card = {
      last4: token.card?.last4,
      brand: token.card?.brand
    }
    console.log("***token", token);
    await db.runTransaction(async (tr) => {
      const stripeInfo = (await tr.get(refStripeSystem)).data();
      if (!stripeInfo) {
        throw new functions.https.HttpsError('invalid-argument', 'This user does not have a stripe customer.')
      }
      tr.set(refStripeReadOnly, {
        card
      }, { merge: true })

      await stripe.customers.update(stripeInfo.customerId, {
        source: tokenId
      })
    });

    return { success: true }
  } catch (error) {
    throw utils.process_error(error)
  }

}
