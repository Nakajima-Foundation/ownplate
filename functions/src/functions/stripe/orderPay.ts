// import Stripe from "stripe";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions/v1";

import { order_status } from "../../common/constant";
import * as utils from "../../lib/utils";
import { notifyNewOrderToRestaurant } from "../notify";
import { Context } from "../../models/TestType";
import { getStripeAccount, getStripeOrderRecord /* getPaymentMethodData, getHash */ } from "./intent";

import { orderChangeData } from "../../lib/types";

export const orderPay = async (db: admin.firestore.Firestore, data: orderChangeData, context: functions.https.CallableContext | Context) => {
  const customerUid = utils.validate_customer_auth(context);
  const { restaurantId, orderId, isSavePay } = data;
  utils.required_params({ restaurantId, orderId });

  const restaurantData = await utils.get_restaurant(db, restaurantId);

  try {
    const orderRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}`);
    const order = (await orderRef.get()).data();
    if (!order) {
      throw new functions.https.HttpsError("invalid-argument", "This order does not exist.");
    }

    if (order.uid !== customerUid) {
      throw new functions.https.HttpsError("failed-precondition", "Invalid user IdIt is not possible to change the order.");
    }
    if (order.status !== order_status.waiting_payment) {
      throw new functions.https.HttpsError("failed-precondition", "It is not possible to change the order.");
    }

    // generate new order
    order.id = orderId;

    // update stripe
    await db.runTransaction(async (transaction) => {
      const restaurantOwnerUid = restaurantData["uid"];
      const stripeAccount = await getStripeAccount(db, restaurantOwnerUid);

      const stripeRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}/system/stripe`);
      const stripeData = await getStripeOrderRecord(transaction, stripeRef);
      const id = stripeData.paymentIntent.id;
      (await transaction.get(orderRef)).data();

      const stripe = utils.get_stripe();
      const paymentIntent = await stripe.paymentIntents.retrieve(id, { expand: ["latest_charge"] }, { stripeAccount });

      if (paymentIntent.status !== "requires_capture") {
        throw new Error("paymentIntent is not requires_capture!");
      }

      await transaction.update(orderRef, {
        isSavePay,
        status: order_status.order_placed,
        orderPlacedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await notifyNewOrderToRestaurant(db, restaurantId, order, restaurantData.restaurantName);
    return { result: true };
  } catch (error) {
    throw utils.process_error(error);
  }
};
