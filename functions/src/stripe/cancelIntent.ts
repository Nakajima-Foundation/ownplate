import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

import { order_status } from "../common/constant";
import * as utils from "../lib/utils";
import { updateOrderTotalDataAndUserLog } from "../functions/order/orderPlace";
import { sendMessageToCustomer, notifyCanceledOrderToRestaurant } from "../functions/notify";
import { Context } from "../models/TestType";

import {
  getStripeAccount,
  getStripeOrderRecord,
  getHash,
} from "./intent";

const stripe = utils.get_stripe();

// This function is called by user or admin to cancel an exsting order (before accepted by admin)
export const cancel = async (db: any, data: any, context: functions.https.CallableContext | Context) => {
  const isAdmin = utils.is_admin_auth(context);
  console.log("is_admin:" + String(isAdmin));

  const uid = isAdmin ? utils.validate_admin_auth(context) : utils.validate_auth(context);

  const { restaurantId, orderId, lng } = data;
  utils.required_params({ restaurantId, orderId }); // lng is optional

  const orderRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}`);
  const stripeRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}/system/stripe`);
  const restaurant = await utils.get_restaurant(db, restaurantId);
  const restaurantOwnerUid = restaurant["uid"];

  try {
    const result = await db.runTransaction(async (transaction) => {
      const orderDoc = await transaction.get(orderRef);
      const order = orderDoc.data();
      order.id = orderDoc.id;
      if (!order) {
        throw new functions.https.HttpsError("invalid-argument", "This order does not exist.");
      }
      if (isAdmin) {
        // Admin can cancel it before confirmed
        if (uid !== restaurantOwnerUid || order.status >= order_status.ready_to_pickup) {
          throw new functions.https.HttpsError("permission-denied", "Invalid order state to cancel.");
        }
      } else {
        // User can cancel an order before accepted
        if (uid !== order.uid || order.status !== order_status.order_placed) {
          throw new functions.https.HttpsError("permission-denied", "Invalid order state to cancel.");
        }
      }
      const cancelTimeKey = uid === order.uid ? "orderCustomerCanceledAt" : "orderRestaurantCanceledAt";
      // user can cancel if restaurant cancel just only payment and status is placed.
      if (!order.payment || !order.payment.stripe || (!isAdmin && order.payment.stripe === "canceled")) {
        // No payment transaction
        await updateOrderTotalDataAndUserLog(db, transaction, order.uid, order.order, restaurantId, uid, order.timePlaced, false);
        transaction.set(
          orderRef,
          {
            timeCanceled: admin.firestore.FieldValue.serverTimestamp(),
            [cancelTimeKey]: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.Timestamp.now(),
            status: order_status.order_canceled,
            uidCanceledBy: uid,
          },
          { merge: true }
        );
        return { success: true, payment: false, order };
      }

      if (order.payment.stripe !== "pending") {
        throw new functions.https.HttpsError("permission-denied", "Invalid payment state to cancel.");
      }
      const stripeRecord = await getStripeOrderRecord(transaction, stripeRef);
      const paymentIntentId = stripeRecord.paymentIntent.id;

      const stripeAccount = await getStripeAccount(db, restaurantOwnerUid);

      const idempotencyKey = getHash([order.id, paymentIntentId].join("-"));
      const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId, {
        idempotencyKey: `${idempotencyKey}-cancel`,
        stripeAccount,
      });
      await updateOrderTotalDataAndUserLog(db, transaction, order.uid, order.order, restaurantId, restaurant.uid, order.timePlaced, false);
      const updateData = {
        timeCanceled: admin.firestore.FieldValue.serverTimestamp(),
        [cancelTimeKey]: admin.firestore.FieldValue.serverTimestamp(),
        status: order_status.order_canceled,
        updatedAt: admin.firestore.Timestamp.now(),
        uidCanceledBy: uid,
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
      return {
        success: true,
        payment: "stripe",
        byUser: uid === order.uid,
        order,
      };
    });
    // sendSMS is always true
    if (isAdmin && result.order.sendSMS) {
      await sendMessageToCustomer(db, lng, "msg_order_canceled", restaurant.restaurantName, result.order, restaurantId, orderId, {}, true);
    }
    if (!isAdmin) {
      await notifyCanceledOrderToRestaurant(db, restaurantId, result.order, restaurant.restaurantName, lng);
    }
    return result;
  } catch (error) {
    throw utils.process_error(error);
  }
};

// This function is called by admin to cancel an exsting order
export const cancelStripePayment = async (db: admin.firestore.Firestore, data: any, context: functions.https.CallableContext | Context) => {
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
      await sendMessageToCustomer(db, lng, "msg_stripe_payment_canceled", restaurant.restaurantName, result.order, restaurantId, orderId, {}, true);
    }
    return { success: true, payment: "stripe" };
  } catch (error) {
    throw utils.process_error(error);
  }
};


