import * as functions from "firebase-functions";

import { getStripeAccount } from "./intent";

import { order_status } from "../common/constant";

import * as utils from "../lib/utils";
import { Context } from "../models/TestType";

const stripe = utils.get_stripe();

export const receipt = async (db, data: any, context: functions.https.CallableContext | Context) => {
  const customerUid = utils.validate_auth(context);
  const { orderId, restaurantId } = data;

  const orderData = (await db.doc(`restaurants/${restaurantId}/orders/${orderId}`).get()).data();
  // check data and owner and status
  if (orderData === null || orderData.uid !== customerUid) {
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
    return {};
  } catch (e) {
    console.log(e);
    throw new functions.https.HttpsError("failed-precondition", "unknow error.");
  }
};
