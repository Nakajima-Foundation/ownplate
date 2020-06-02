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
}
