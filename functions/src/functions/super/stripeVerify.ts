import * as admin from "firebase-admin";
import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import * as utils from "../../lib/utils";
import { validatorStripeOAuthVerify } from "../../lib/validator";
import { stripeOAuthVerifyData } from "../../lib/types";

export const verify = async (db: admin.firestore.Firestore, data: stripeOAuthVerifyData, context: CallableRequest) => {
  // just
  if (!context.auth?.token?.admin) {
    throw new HttpsError("permission-denied", "You do not have permission to confirm this request.");
  }
  const stripe = utils.get_stripe_v2();

  const { account_id } = data;
  utils.required_params({ account_id });

  const validateResult = validatorStripeOAuthVerify(data);
  if (!validateResult.result) {
    console.error("connect", validateResult.errors);
    throw new HttpsError("invalid-argument", "Validation Error.");
  }

  try {
    const account = await stripe.accounts.retrieve(account_id);
    return { result: true, account };
  } catch (error) {
    throw utils.process_error(error);
  }
};
