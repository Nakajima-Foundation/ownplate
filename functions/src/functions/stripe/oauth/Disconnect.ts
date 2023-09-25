import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import * as utils from "../../../lib/utils";
import { ownPlateConfig } from "../../../common/project";

export const disconnect = async (db: admin.firestore.Firestore, context: functions.https.CallableContext) => {
  const uid = utils.validate_admin_auth(context);
  const stripe = utils.get_stripe();

  const client_id = ownPlateConfig.stripe.clientId;
  if (!client_id) {
    throw new functions.https.HttpsError("invalid-argument", "No Stripe client.");
  }

  try {
    const refPayment = db.doc(`/admins/${uid}/public/payment`);
    const payment = (await refPayment.get()).data();
    const stripe_user_id = payment?.stripe;
    if (!stripe_user_id) {
      throw new functions.https.HttpsError("invalid-argument", "This account is not connected to Stripe.");
    }

    // We remove it from the database first, so that the operator can attempt to re-connect
    // if something goes wrong.
    await refPayment.update({
      stripe: null,
    });

    await db.doc(`/admins/${uid}/system/stripe`).delete();

    await stripe.oauth.deauthorize({
      client_id,
      stripe_user_id,
    });

    return { result: true };
  } catch (error) {
    throw utils.process_error(error);
  }
};
