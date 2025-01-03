import * as admin from "firebase-admin";
import * as functions from "firebase-functions/v1";
import * as utils from "../../lib/utils";
import { validatorStripeOAuthVerify } from "../../lib/validator";
import { stripeOAuthVerifyData } from "../../lib/types";

export const verify = async (db: admin.firestore.Firestore, data: stripeOAuthVerifyData, context: functions.https.CallableContext) => {
  // just
  if (!context.auth?.token?.admin) {
    throw new functions.https.HttpsError("permission-denied", "You do not have permission to confirm this request.");
  }
  const stripe = utils.get_stripe();

  const { account_id } = data;
  utils.required_params({ account_id });

  const validateResult = validatorStripeOAuthVerify(data);
  if (!validateResult.result) {
    console.error("connect", validateResult.errors);
    throw new functions.https.HttpsError("invalid-argument", "Validation Error.");
  }

  try {
    const account = await stripe.accounts.retrieve(account_id);
    return { result: true, account };
  } catch (error) {
    throw utils.process_error(error);
  }
};
