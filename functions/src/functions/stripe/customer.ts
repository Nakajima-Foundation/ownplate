import * as admin from "firebase-admin";
import * as utils from "../../lib/utils";

// called by order/orderCreated
export const createCustomer = async (db: admin.firestore.Firestore, uid: string, phoneNumber: string) => {
  const stripe = utils.get_stripe_v2();
  await db.runTransaction(async (tr) => {
    const refStripe = db.doc(`/users/${uid}/system/stripe`);
    const stripeInfo = (await tr.get(refStripe)).data();

    // Create a stripe customer if we haven't created yet
    if (!stripeInfo) {
      const customer = await stripe.customers.create({
        description: phoneNumber,
        metadata: { uid, phoneNumber },
      });
      tr.set(refStripe, {
        customerId: customer.id,
      });
    }
  });
};

// called by delete account
export const deleteCustomer = async (db: admin.firestore.Firestore, uid: string) => {
  const stripe = utils.get_stripe();
  const refStripeSystem = db.doc(`/users/${uid}/system/stripe`);
  const refStripeReadOnly = db.doc(`/users/${uid}/readonly/stripe`);
  await db.runTransaction(async (tr) => {
    const stripeInfo = (await tr.get(refStripeSystem)).data();
    if (stripeInfo) {
      tr.delete(refStripeSystem);
      tr.delete(refStripeReadOnly);
      try {
        await stripe.customers.del(stripeInfo.customerId);
      } catch (error) {
        // This happens if the customer was removed from the Stripe console.
        // Therefore, it is fine to ignore this error.
        console.error(error);
      }
    }
  });
};

