import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

import { getStripeAccount } from "./intent";

import { order_status } from "../../common/constant";

import * as utils from "../../lib/utils";
import { Context } from "../../models/TestType";
import { validateStripeReceipt } from "../../lib/validator";
import { stripeReceiptData } from "../../lib/types";

export const receipt = async (db: admin.firestore.Firestore, data: stripeReceiptData, context: functions.https.CallableContext | Context) => {
  const stripe = utils.get_stripe();

  const customerUid = utils.validate_customer_auth(context);
  const validateResult = validateStripeReceipt(data);
  if (!validateResult.result) {
    console.error("receipt", validateResult.errors);
    throw new functions.https.HttpsError("invalid-argument", "Validation Error.");
  }

  const { orderId, restaurantId } = data;

  const orderData = (await db.doc(`restaurants/${restaurantId}/orders/${orderId}`).get()).data();
  // check data and owner and status
  if (orderData === null || orderData === undefined || orderData.uid !== customerUid) {
    console.log("order is not exit or no match uid.");
    throw new functions.https.HttpsError("failed-precondition", "This order is invalid.");
  }
  if (order_status.order_accepted > orderData.status) {
    console.log("order is not payed.");
    throw new functions.https.HttpsError("failed-precondition", "This order is invalid.");
  }

  const restaurant = await utils.get_restaurant(db, restaurantId);
  const restaurantOwnerUid = restaurant["uid"];

  try {
    const stripeAccount = await getStripeAccount(db, restaurantOwnerUid);
    const stripeData = (await db.doc(`restaurants/${restaurantId}/orders/${orderId}/system/stripe`).get()).data();
    if (!stripeData || !stripeData.paymentIntent || !stripeData.paymentIntent.id) {
      console.log("order is not stripe payment.");
      throw new functions.https.HttpsError("failed-precondition", "This order has no paymentIntendId.");
    }
    const paymentIntentId = stripeData.paymentIntent.id;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, { stripeAccount });
    if (paymentIntent && paymentIntent.charges && paymentIntent.charges.data && paymentIntent.charges.data[0].receipt_url) {
      return {
        receipt_url: paymentIntent.charges.data[0].receipt_url,
      };
    }
    return { result: true };
  } catch (e) {
    console.log(e);
    throw new functions.https.HttpsError("failed-precondition", "unknow error.");
  }
};
