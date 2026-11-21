import { Firestore } from "firebase-admin/firestore";
import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import * as utils from "../../../lib/utils";
import { ownPlateConfig } from "../../../common/project";

export const disconnect = async (db: Firestore, context: CallableRequest) => {
  const uid = utils.validate_admin_auth(context);
  const stripe = utils.get_stripe_v2();

  const client_id = ownPlateConfig.stripe.clientId;
  if (!client_id) {
    throw new HttpsError("invalid-argument", "No Stripe client.");
  }

  try {
    const refPayment = db.doc(`/admins/${uid}/public/payment`);
    const refStripe = db.doc(`/admins/${uid}/system/stripe`);
    // 解除する相手は、関数だけが書ける system/stripe を正とする
    const stripeInfo = (await refStripe.get()).data();
    // 2020-06-22 より前の連携は、トークンの応答を包まずに保存している
    const stripe_user_id =
      stripeInfo?.auth?.stripe_user_id ?? stripeInfo?.stripe_user_id;
    if (!stripe_user_id) {
      throw new HttpsError(
        "invalid-argument",
        "This account is not connected to Stripe.",
      );
    }

    // We remove it from the database first, so that the operator can attempt to re-connect
    // if something goes wrong.
    await refPayment.update({
      stripe: null,
    });

    await refStripe.delete();

    await stripe.oauth.deauthorize({
      client_id,
      stripe_user_id,
    });

    return { result: true };
  } catch (error) {
    throw utils.process_error(error as Error);
  }
};
