import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import * as utils from "../../lib/utils";
import { validateStripeUpdateCustomer } from "../../lib/validator";
import { stripeUpdateCustomerData } from "../../lib/types";

// called by order/orderCreated
export const createCustomer = async (db: admin.firestore.Firestore, uid: string, phoneNumber: string) => {
  const stripe = utils.get_stripe();
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

// function
export const updateCustomer = async (db: admin.firestore.Firestore, data: stripeUpdateCustomerData, context: functions.https.CallableContext) => {
  const customerUid = utils.validate_customer_auth(context);
  const { tokenId, reuse } = data;
  utils.required_params({ tokenId });

  const validateResult = validateStripeUpdateCustomer(data);
  if (!validateResult.result) {
    console.error("updateCustomer", validateResult.errors);
    throw new functions.https.HttpsError("invalid-argument", "Validation Error.");
  }

  const stripe = utils.get_stripe();

  const refStripeSystem = db.doc(`/users/${customerUid}/system/stripe`);
  const refStripeReadOnly = db.doc(`/users/${customerUid}/readonly/stripe`);

  try {
    const token = await stripe.tokens.retrieve(tokenId);
    const card = {
      last4: token.card?.last4,
      brand: token.card?.brand,
      exp_month: token.card?.exp_month,
      exp_year: token.card?.exp_year,
    };
    // console.log("***token", token);
    await db.runTransaction(async (tr) => {
      const stripeInfo = (await tr.get(refStripeSystem)).data();
      if (!stripeInfo) {
        throw new functions.https.HttpsError("invalid-argument", "This user does not have a stripe customer.");
      }
      // Store the stripe info in the readonly area (accessible from the client) only if the user wants to reuse it.
      // Notice that we still need to associate the stripe info the the customer internally.
      if (reuse) {
        tr.set(
          refStripeReadOnly,
          {
            card,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      } else {
        // We need to delete the old card info (if exists). Otherwise, the new one will become the default and
        // will be reused (even though the end-user unchecks the "re-user" checkbox).
        // This is a little bit incombinient (the user can not reuse the first one any more,
        // after using the second one even though she/he uncheks the 'reuse' button), but this is better
        // than introducing the complexity of managing multiple cards.
        tr.delete(refStripeReadOnly);
      }

      await stripe.customers.update(stripeInfo.customerId, {
        source: tokenId,
      });
    });

    return { success: true };
  } catch (error) {
    throw utils.process_error(error);
  }
};
