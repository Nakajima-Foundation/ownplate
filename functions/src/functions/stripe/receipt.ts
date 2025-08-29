import * as admin from "firebase-admin";
import { CallableRequest, HttpsError } from "firebase-functions/v2/https";

import { getStripeAccount } from "./intent";

import { order_status } from "../../common/constant";

import * as utils from "../../lib/utils";
import { validateStripeReceipt } from "../../lib/validator";
import { stripeReceiptData } from "../../lib/types";

export const receipt = async (db: admin.firestore.Firestore, data: stripeReceiptData, context: CallableRequest) => {
  const stripe = utils.get_stripe_v2();

  const customerUid = utils.validate_customer_auth(context);
  const validateResult = validateStripeReceipt(data);
  if (!validateResult.result) {
    console.error("receipt", validateResult.errors);
    throw new HttpsError("invalid-argument", "Validation Error.");
  }

  const { orderId, restaurantId } = data;

  const orderData = (await db.doc(`restaurants/${restaurantId}/orders/${orderId}`).get()).data();
  // check data and owner and status
  if (orderData === null || orderData === undefined || orderData.uid !== customerUid) {
    console.log("order is not exit or no match uid.");
    throw new HttpsError("failed-precondition", "This order is invalid.");
  }
  if (order_status.order_accepted > orderData.status) {
    console.log("order is not payed.");
    throw new HttpsError("failed-precondition", "This order is invalid.");
  }

  const restaurant = await utils.get_restaurant(db, restaurantId);
  const restaurantOwnerUid = restaurant["uid"];

  try {
    const stripeAccount = await getStripeAccount(db, restaurantOwnerUid);
    const stripeData = (await db.doc(`restaurants/${restaurantId}/orders/${orderId}/system/stripe`).get()).data();
    if (!stripeData || !stripeData.paymentIntent || !stripeData.paymentIntent.id) {
      console.log("order is not stripe payment.");
      throw new HttpsError("failed-precondition", "This order has no paymentIntendId.");
    }
    const paymentIntentId = stripeData.paymentIntent.id;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, { expand: ["latest_charge"] }, { stripeAccount });
    if (paymentIntent?.latest_charge && typeof paymentIntent.latest_charge !== "string") {
      return {
        receipt_url: paymentIntent?.latest_charge?.receipt_url,
      };
    }
    return { result: true };
  } catch (e) {
    console.log(e);
    throw new HttpsError("failed-precondition", "unknow error.");
  }
};
