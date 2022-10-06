import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import * as utils from "../../lib/utils";

export const verify = async (db: admin.firestore.Firestore, data: any, context: functions.https.CallableContext) => {
  if (!context.auth?.token?.admin) {
    throw new functions.https.HttpsError("permission-denied", "You do not have permission to confirm this request.");
  }
  const stripe = utils.get_stripe();

  const { account_id } = data;
  utils.required_params({ account_id });
  try {
    const account = await stripe.accounts.retrieve(account_id);
    return { result: true, account };
  } catch (error) {
    throw utils.process_error(error);
  }
};
