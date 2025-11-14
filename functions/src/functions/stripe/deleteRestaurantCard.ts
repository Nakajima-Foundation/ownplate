import * as admin from "firebase-admin";
import { CallableRequest } from "firebase-functions/v2/https";
import * as utils from "../../lib/utils";

// Delete card information for a specific restaurant
export const deleteRestaurantCard = async (
  db: admin.firestore.Firestore,
  data: { ownerUid: string },
  context: CallableRequest
) => {
  const customerUid = utils.validate_customer_auth(context);
  const { ownerUid } = data;

  if (!ownerUid) {
    throw new Error("ownerUid is required");
  }

  try {
    // Delete the stripe information for this specific restaurant owner
    const refStripeSystem = db.doc(
      `/users/${customerUid}/owner/${ownerUid}/system/stripe`
    );
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
