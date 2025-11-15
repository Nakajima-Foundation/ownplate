import * as admin from "firebase-admin";
import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import * as utils from "../../lib/utils";
import { StripeDeleteRestaurantCardData } from "../../models/functionTypes";
import { getStripeAccount } from "./intent";

// Delete card information for a specific restaurant
export const deleteRestaurantCard = async (
  db: admin.firestore.Firestore,
  data: StripeDeleteRestaurantCardData,
  context: CallableRequest
) => {
  const customerUid = utils.validate_customer_auth(context);
  const { ownerUid } = data;

  if (!ownerUid) {
    throw new HttpsError("invalid-argument", "ownerUid is required");
  }

  // Validate ownerUid format (Firebase UID: alphanumeric characters only)
  const uidRegex = /^[a-zA-Z0-9]+$/;
  if (!uidRegex.test(ownerUid)) {
    throw new HttpsError("invalid-argument", "Invalid ownerUid format");
  }

  // Validate that ownerUid corresponds to a valid restaurant owner (admin user)
  const adminDoc = await db.doc(`/admins/${ownerUid}`).get();
  if (!adminDoc.exists) {
    throw new HttpsError("invalid-argument", "Invalid ownerUid: not a valid restaurant owner");
  }

  try {
    // Retrieve the stripe information for this specific restaurant owner
    const refStripeSystem = db.doc(
      `/users/${customerUid}/owner/${ownerUid}/system/stripe`
    );
    const stripeInfo = (await refStripeSystem.get()).data();

    // Try to delete the payment method from Stripe if it exists
    // Even if this fails, we continue to delete the local database records
    if (stripeInfo && stripeInfo.payment_method) {
      try {
        const stripeAccount = await getStripeAccount(db, ownerUid);
        const stripe = utils.get_stripe_v2();

        // Detach the payment method from the customer
        await stripe.paymentMethods.detach(
          stripeInfo.payment_method,
          { stripeAccount }
        );
        console.log(`Payment method ${stripeInfo.payment_method} detached successfully`);
      } catch (stripeError) {
        // Log the error but continue with database deletion
        console.error("Failed to detach payment method from Stripe:", stripeError);
      }
    }

    // Delete the stripe information for this specific restaurant owner
    // This should always succeed even if Stripe API call failed
    await refStripeSystem.delete();

    const refStripeReadOnly = db.doc(
      `/users/${customerUid}/owner/${ownerUid}/readonly/stripe`
    );
    await refStripeReadOnly.delete();

    return { result: true };
  } catch (error) {
    throw utils.process_error(error as Error);
  }
};
