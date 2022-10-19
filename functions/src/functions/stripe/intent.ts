import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import * as crypto from "crypto";
import * as utils from "../../lib/utils";

export const stripe = utils.get_stripe();

export const getCustomerStripeInfo = async (db: admin.firestore.Firestore, customerUid: string) => {
  const refStripe = db.doc(`/users/${customerUid}/system/stripe`);
  const stripeInfo = (await refStripe.get()).data();
  if (!stripeInfo) {
    throw new functions.https.HttpsError("aborted", "No stripeInfo.");
  }
  return stripeInfo;
};

export const getStripeAccount = async (db: admin.firestore.Firestore, restaurantOwnerUid: string) => {
  const paymentSnapshot = await db.doc(`/admins/${restaurantOwnerUid}/public/payment`).get();
  const stripeAccount = paymentSnapshot.data()?.stripe;
  if (!stripeAccount) {
    throw new functions.https.HttpsError("invalid-argument", "This restaurant does not support payment.");
  }
  return stripeAccount;
};

export const getStripeOrderRecord = async (transaction: admin.firestore.Transaction, stripeRef:  admin.firestore.DocumentReference) => {
  const stripeRecord = (await transaction.get(stripeRef)).data();
  if (!stripeRecord || !stripeRecord.paymentIntent || !stripeRecord.paymentIntent.id) {
    throw new functions.https.HttpsError("failed-precondition", "This order has no paymentIntendId.");
  }
  return stripeRecord;
};

export const getPaymentMethodData = async (db: admin.firestore.Firestore, restaurantOwnerUid: string, customerUid: string) => {
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
