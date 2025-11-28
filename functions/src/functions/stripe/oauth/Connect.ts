import * as admin from "firebase-admin";
import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import * as utils from "../../../lib/utils";
import { validatorStripeOAuthConnect } from "../../../lib/validator";

export const connect = async (db: admin.firestore.Firestore, data: { code: string }, context: CallableRequest) => {
  const uid = utils.validate_admin_auth(context);
  const stripe = utils.get_stripe_v2();

  const { code } = data;
  utils.required_params({ code });

  const validateResult = validatorStripeOAuthConnect(data);
  if (!validateResult.result) {
    console.error("connect", validateResult.errors);
    throw new HttpsError("invalid-argument", "Validation Error.");
  }

  try {
    const refStripe = db.doc(`/admins/${uid}/system/stripe`);

    // Detect the case where this function was called again with same code twice
    const stripeInfo = (await refStripe.get()).data();
    if (stripeInfo && stripeInfo.code === code) {
      return { result: true, duplicate: true };
    }

    const response = await stripe.oauth.token({
      grant_type: "authorization_code",
      code: code,
    });

    const batch = db.batch();
    batch.set(refStripe, { auth: response, code });
    batch.set(
      db.doc(`/admins/${uid}/public/payment`),
      {
        stripe: response.stripe_user_id,
      },
      {
        merge: true,
      },
    );
    await batch.commit();
    return { result: true };
  } catch (error) {
    throw utils.process_error(error as Error);
  }
};
