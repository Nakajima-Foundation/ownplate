import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

import * as utils from "../../lib/utils";
import { sendMessageToCustomer } from "../notify";
import { Context } from "../../models/TestType";

import { getStripeAccount, getStripeOrderRecord, getHash } from "./intent";

import { orderCancelPaymentData } from "../../lib/types";

const stripe = utils.get_stripe();

// This function is called by admin to cancel an exsting order
export const cancelStripePayment = async (db: admin.firestore.Firestore, data: orderCancelPaymentData, context: functions.https.CallableContext | Context) => {
  const uid = utils.validate_admin_auth(context);

  const { restaurantId, orderId, lng } = data;
  utils.required_params({ restaurantId, orderId }); // lng is optional

  const orderRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}`);
  const stripeRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}/system/stripe`);
  const restaurant = await utils.get_restaurant(db, restaurantId);
  const restaurantOwnerUid = restaurant["uid"];

  const stripeAccount = await getStripeAccount(db, restaurantOwnerUid);

  try {
    const result = await db.runTransaction(async (transaction) => {
      const order = (await transaction.get(orderRef)).data();
      if (!order) {
        throw new functions.https.HttpsError("invalid-argument", "This order does not exist.");
      }

      if (!order.payment || !order.payment.stripe || order.payment.stripe !== "pending") {
        throw new functions.https.HttpsError("permission-denied", "Invalid order state to cancel payment.");
      }

      const stripeRecord = await getStripeOrderRecord(transaction, stripeRef);
      const paymentIntentId = stripeRecord.paymentIntent.id;

      const idempotencyKey = getHash([order.id, paymentIntentId].join("-"));
      const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId, {
        idempotencyKey: `${idempotencyKey}-cancel`,
        stripeAccount,
      });
      const updateData = {
        orderRestaurantPaymentCanceledAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.Timestamp.now(),
        uidPaymentCanceledBy: uid,
        payment: {
          stripe: "canceled",
        },
      };
      transaction.set(orderRef, updateData, { merge: true });
      transaction.set(
        stripeRef,
        {
          paymentIntent,
        },
        { merge: true }
      );
      Object.assign(order, updateData);
      return { success: true, payment: "stripe", order };
    });
    // sendSMS is always true
    if (result.order.sendSMS) {
      await sendMessageToCustomer(db, lng || "", "msg_stripe_payment_canceled", restaurant.restaurantName, result.order, restaurantId, orderId, {}, true);
    }
    return { success: true, payment: "stripe" };
  } catch (error) {
    throw utils.process_error(error);
  }
};
