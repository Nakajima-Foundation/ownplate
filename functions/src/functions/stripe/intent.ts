import * as functions from "firebase-functions";
import * as crypto from "crypto";
import * as utils from "../../lib/utils";

export const stripe = utils.get_stripe();

export const getCustomerStripeInfo = async (db: any, customerUid: string) => {
  const refStripe = db.doc(`/users/${customerUid}/system/stripe`);
  const stripeInfo = (await refStripe.get()).data();
  if (!stripeInfo) {
    throw new functions.https.HttpsError("aborted", "No stripeInfo.");
  }
  return stripeInfo;
};

export const getStripeAccount = async (db: any, restaurantOwnerUid: string) => {
  const paymentSnapshot = await db.doc(`/admins/${restaurantOwnerUid}/public/payment`).get();
  const stripeAccount = paymentSnapshot.data()?.stripe;
  if (!stripeAccount) {
    throw new functions.https.HttpsError("invalid-argument", "This restaurant does not support payment.");
  }
  return stripeAccount;
};

export const getStripeOrderRecord = async (transaction: any, stripeRef: any) => {
  const stripeRecord = (await transaction.get(stripeRef)).data();
  if (!stripeRecord || !stripeRecord.paymentIntent || !stripeRecord.paymentIntent.id) {
    throw new functions.https.HttpsError("failed-precondition", "This order has no paymentIntendId.");
  }
  return stripeRecord;
};

export const getPaymentMethodData = async (db: any, restaurantOwnerUid: string, customerUid: string) => {
  const stripeAccount = await getStripeAccount(db, restaurantOwnerUid);

  const stripeInfo = await getCustomerStripeInfo(db, customerUid);
  const token = await stripe.tokens.create(
    {
      customer: stripeInfo.customerId,
    },
    {
      stripeAccount: stripeAccount,
    }
  );
  const paymentMethodData = {
    type: "card",
    card: {
      token: token.id,
    },
  };
  return paymentMethodData;
};

export const getHash = (message: string) => {
  return crypto.createHash("sha256").update(message).digest("hex");
};
