import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

import { order_status } from "../../common/constant";
import * as utils from "../../lib/utils";
import { updateOrderTotalDataAndUserLog } from "../order/orderPlace";
import { sendMessageToCustomer, notifyCanceledOrderToRestaurant } from "../notify";
import { Context } from "../../models/TestType";

import { getStripeAccount, getStripeOrderRecord, getHash } from "./intent";
import { validateCancel } from "../../lib/validator";
import { orderCancelData } from "../../lib/types";

// This function is called by user or admin to cancel an exsting order (before accepted by admin)
export const cancel = async (db: admin.firestore.Firestore, data: orderCancelData, context: functions.https.CallableContext | Context) => {
  const isAdmin = utils.is_admin_auth(context);

  const uid = isAdmin ? utils.validate_owner_admin_auth(context) : utils.validate_customer_auth(context);

  const { restaurantId, orderId } = data;
  utils.required_params({ restaurantId, orderId });

  const validateResult = validateCancel(data);
  if (!validateResult.result) {
    console.error("cancel", validateResult.errors);
    throw new functions.https.HttpsError("invalid-argument", "Validation Error.");
  }

  if (utils.is_subAccount(context)) {
    const adminUid = utils.validate_auth(context);
    await utils.validate_sub_account_request(db, adminUid, uid, restaurantId);
  }
  
  const orderRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}`);
  const stripeRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}/system/stripe`);
  const restaurant = await utils.get_restaurant(db, restaurantId);
  const restaurantOwnerUid = restaurant["uid"];

  const now = admin.firestore.Timestamp.now();

  try {
    const result = await db.runTransaction(async (transaction) => {
      const orderDoc = await transaction.get(orderRef);
      const order = orderDoc.data();
      if (!order) {
        throw new functions.https.HttpsError("invalid-argument", "This order does not exist.");
      }
      order.id = orderDoc.id;
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
        await updateOrderTotalDataAndUserLog(db, transaction, order.uid, order.order, restaurantId, uid, order.timePlaced, now, false);
        transaction.set(
          orderRef,
          {
            timeCanceled: admin.firestore.FieldValue.serverTimestamp(),
            [cancelTimeKey]: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: now,
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
      const stripe = utils.get_stripe();
      const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId, {
        idempotencyKey: `${idempotencyKey}-cancel`,
        stripeAccount,
      });
      await updateOrderTotalDataAndUserLog(db, transaction, order.uid, order.order, restaurantId, restaurant.uid, order.timePlaced, now, false);
      const updateData = {
        timeCanceled: admin.firestore.FieldValue.serverTimestamp(),
        [cancelTimeKey]: admin.firestore.FieldValue.serverTimestamp(),
        status: order_status.order_canceled,
        updatedAt: now,
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
      await sendMessageToCustomer(db, "msg_order_canceled", restaurant.restaurantName, result.order, restaurantId, orderId, {}, true);
    }
    if (!isAdmin) {
      await notifyCanceledOrderToRestaurant(db, restaurantId, result.order, restaurant.restaurantName);
    }
    return { result: true };
  } catch (error) {
    throw utils.process_error(error);
  }
};
