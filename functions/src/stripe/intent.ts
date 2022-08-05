import Stripe from "stripe";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

import { order_status, next_transitions, order_status_keys, timeEventMapping } from "../common/constant";
import * as utils from "../lib/utils";
import { orderAccounting, createNewOrderData, getGroupRestautantRef, updateOrderTotalDataAndUserLog } from "../functions/order";
import { sendMessageToCustomer, notifyNewOrderToRestaurant, notifyCanceledOrderToRestaurant } from "../functions/notify";
import { costCal } from "../common/commonUtils";
import { Context } from "../models/TestType";

import * as crypto from "crypto";

import moment from "moment-timezone";

const multiple = utils.getStripeRegion().multiple; // 100 for USD, 1 for JPY
const stripe = utils.get_stripe();

const getCustomerStripeInfo = async (db: any, customerUid: string) => {
  const refStripe = db.doc(`/users/${customerUid}/system/stripe`);
  const stripeInfo = (await refStripe.get()).data();
  if (!stripeInfo) {
    throw new functions.https.HttpsError("aborted", "No stripeInfo.");
  }
  return stripeInfo;
};
const getOrderData = async (transaction: any, orderRef: any) => {
  const orderDoc = await transaction.get(orderRef);
  const order = orderDoc.data();
  if (!order) {
    throw new functions.https.HttpsError("invalid-argument", "This order does not exist.");
  }
  order.id = orderDoc.id;
  return order;
};

const getStripeOrderRecord = async (transaction: any, stripeRef: any) => {
  const stripeRecord = (await transaction.get(stripeRef)).data();
  if (!stripeRecord || !stripeRecord.paymentIntent || !stripeRecord.paymentIntent.id) {
    throw new functions.https.HttpsError("failed-precondition", "This order has no paymentIntendId.");
  }
  return stripeRecord;
};

export const getStripeAccount = async (db: any, restaurantOwnerUid: string) => {
  const paymentSnapshot = await db.doc(`/admins/${restaurantOwnerUid}/public/payment`).get();
  const stripeAccount = paymentSnapshot.data()?.stripe;
  if (!stripeAccount) {
    throw new functions.https.HttpsError("invalid-argument", "This restaurant does not support payment.");
  }
  return stripeAccount;
};
const getPaymentMethodData = async (db: any, restaurantOwnerUid: string, customerUid: string) => {
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

const getHash = (message: string) => {
  return crypto.createHash("sha256").update(message).digest("hex");
};

// This function is called by user to create a "payment intent" (to start the payment transaction)
export const create = async (db: admin.firestore.Firestore, data: any, context: functions.https.CallableContext) => {
  const customerUid = utils.validate_auth(context);

  const { orderId, restaurantId, description, tip, sendSMS, timeToPickup, lng, memo, customerInfo } = data;
  const _tip = Number(tip) || 0;
  utils.validate_params({ orderId, restaurantId }); // lng, tip and sendSMS are optional
  const restaurantData = await utils.get_restaurant(db, restaurantId);
  const restaurantOwnerUid = restaurantData["uid"];
  const postage = restaurantData.isEC ? await utils.get_restaurant_postage(db, restaurantId) : {};

  try {
    const result = await db.runTransaction(async (transaction) => {
      const stripeAccount = await getStripeAccount(db, restaurantOwnerUid);
      const stripeRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}/system/stripe`);

      const customerRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}/customer/data`);
      const orderRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}`);
      const order = await getOrderData(transaction, orderRef);
      if (order.status !== order_status.validation_ok) {
        throw new functions.https.HttpsError("failed-precondition", "This order is invalid.");
      }
      const shippingCost = restaurantData.isEC ? costCal(postage, customerInfo?.prefectureId, order.total) : 0;
      const hasCustomer = restaurantData.isEC || order.isDelivery;
      if (hasCustomer) {
        // for transaction lock
        await transaction.get(customerRef);
      }

      const totalChargeWithTipAndMultipled = Math.round((order.total + Math.max(0, _tip) + (shippingCost || 0)) * multiple);

      // We expect that there is a customer Id associated with a token
      const payment_method_data = await getPaymentMethodData(db, restaurantOwnerUid, customerUid);
      const request = {
        setup_future_usage: "off_session",
        amount: totalChargeWithTipAndMultipled,
        description: `${description} ${orderId}`,
        currency: utils.getStripeRegion().currency,
        metadata: { uid: customerUid, restaurantId, orderId },
        payment_method_data,
      } as Stripe.PaymentIntentCreateParams;

      const idempotencyKey = getHash([orderRef.path, payment_method_data.card.token].join("-"));
      const paymentIntent = await stripe.paymentIntents.create(request, {
        idempotencyKey,
        stripeAccount,
      });
      const timePlaced = (timeToPickup && new admin.firestore.Timestamp(timeToPickup.seconds, timeToPickup.nanoseconds)) || admin.firestore.FieldValue.serverTimestamp();

      // start write transaction
      await updateOrderTotalDataAndUserLog(db, transaction, customerUid, order.order, restaurantId, customerUid, timePlaced, true);
      if (hasCustomer) {
        await transaction.set(customerRef, {
          ...customerInfo,
          uid: customerUid,
          orderId,
          restaurantId,
          createdAt: admin.firestore.Timestamp.now(),
        });
      }

      const updateData = {
        status: order_status.order_placed,
        totalCharge: totalChargeWithTipAndMultipled / multiple,
        tip: Math.round(_tip * multiple) / multiple,
        shippingCost,
        sendSMS: sendSMS || false,
        updatedAt: admin.firestore.Timestamp.now(),
        orderPlacedAt: admin.firestore.Timestamp.now(),
        timePlaced,
        description: request.description,
        memo: memo || "",
        isEC: restaurantData.isEC || false,
        // customerInfo: customerInfo || {},
        payment: {
          stripe: "pending",
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
      return { success: true, order };
    });

    await notifyNewOrderToRestaurant(db, restaurantId, result.order, restaurantData.restaurantName, lng);

    return result;
  } catch (error) {
    throw utils.process_error(error);
  }
};

// This function is called by admin to confurm a "payment intent" (to complete the payment transaction)
// order_accepted  not ready_to_pickup.
export const confirm = async (db: admin.firestore.Firestore, data: any, context: functions.https.CallableContext) => {
  const ownerUid = utils.validate_admin_auth(context);

  const { restaurantId, orderId, lng, timezone, timeEstimated } = data;
  utils.validate_params({ restaurantId, orderId });

  const orderRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}`);
  const stripeRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}/system/stripe`);
  const restaurantData = await utils.get_restaurant(db, restaurantId);
  const restaurantOwnerUid = restaurantData["uid"];
  const stripeAccount = await getStripeAccount(db, restaurantOwnerUid);
  if (restaurantOwnerUid !== ownerUid) {
    throw new functions.https.HttpsError("permission-denied", "You do not have permission to confirm this request.");
  }

  try {
    const result = await db.runTransaction(async (transaction) => {
      const order = (await transaction.get(orderRef)).data();
      if (!order) {
        throw new functions.https.HttpsError("invalid-argument", "This order does not exist.");
      }
      order.id = orderId;

      if (
        order.status !== order_status.order_placed // from 2021-07-17
      ) {
        // obsolete but backward compability
        throw new functions.https.HttpsError("failed-precondition", "This order is not ready yet.");
      }
      if (!order.payment || order.payment.stripe !== "pending") {
        throw new functions.https.HttpsError("failed-precondition", "Stripe process was done.");
      }

      const nextStatus = next_transitions[order.status];
      const stripeRecord = await getStripeOrderRecord(transaction, stripeRef);
      const paymentIntentId = stripeRecord.paymentIntent.id;

      const idempotencyKey = getHash([order.id, paymentIntentId].join("-"));
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
        idempotencyKey,
        stripeAccount,
      });

      const updateTimeKey = timeEventMapping[order_status_keys[nextStatus]];
      const updateData = {
        status: nextStatus,
        updatedAt: admin.firestore.Timestamp.now(),
        [updateTimeKey]: admin.firestore.Timestamp.now(),
        payment: {
          stripe: "confirmed",
        },
      } as any;
      if (nextStatus === order_status.order_accepted) {
        updateData.timeEstimated = timeEstimated ? new admin.firestore.Timestamp(timeEstimated.seconds, timeEstimated.nanoseconds) : order.timePlaced;
        order.timeEstimated = updateData.timeEstimated;
      }
      transaction.set(orderRef, updateData, { merge: true });
      transaction.set(
        stripeRef,
        {
          paymentIntent,
        },
        { merge: true }
      );

      Object.assign(order, updateData);
      return { success: true, order };
    });

    const orderData = result.order;

    const params = {
      time: moment(orderData.timeEstimated.toDate())
        .tz(timezone || "Asia/Tokyo")
        .locale("ja")
        .format("LLL"),
    };
    console.log("timeEstimated", params["time"]);
    const msgKey = orderData.isEC ? "msg_ec_order_accepted" : "msg_order_accepted";
    await sendMessageToCustomer(db, lng, msgKey, restaurantData.restaurantName, orderData, restaurantId, orderId, params);

    return result;
  } catch (error) {
    throw utils.process_error(error);
  }
};

// This function is called by user or admin to cancel an exsting order (before accepted by admin)
export const cancel = async (db: any, data: any, context: functions.https.CallableContext | Context) => {
  const isAdmin = utils.is_admin_auth(context);
  console.log("is_admin:" + String(isAdmin));

  const uid = isAdmin ? utils.validate_admin_auth(context) : utils.validate_auth(context);

  const { restaurantId, orderId, lng } = data;
  utils.validate_params({ restaurantId, orderId }); // lng is optional

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
  utils.validate_params({ restaurantId, orderId }); // lng is optional

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

const getUpdateOrder = (newOrder, order, options, rawOptions) => {
  const updateOrderData = {};
  const updateOptions = {};
  const updateRawOptions = {};

  newOrder.forEach((data) => {
    const { menuId, index } = data;
    if (!utils.isEmpty(order[menuId]) && !utils.isEmpty(order[menuId][index])) {
      if (utils.isEmpty(updateOrderData[menuId])) {
        updateOrderData[menuId] = [];
        updateOptions[menuId] = {};
        updateRawOptions[menuId] = {};
      }
      updateOrderData[menuId].push(order[menuId][index]);
      const optionIndex = updateOrderData[menuId].length - 1;
      updateOptions[menuId][optionIndex] = options[menuId][optionIndex];
      updateRawOptions[menuId][optionIndex] = rawOptions[menuId][optionIndex];
    }
  });

  return {
    updateOrderData,
    updateOptions,
    updateRawOptions,
  };
};
export const orderChange = async (db: any, data: any, context: functions.https.CallableContext | Context) => {
  const ownerUid = utils.validate_admin_auth(context);
  const { restaurantId, orderId, newOrder, timezone, lng } = data;
  utils.validate_params({ restaurantId, orderId, newOrder, timezone }); // lng, timeEstimated is optional

  const restaurantRef = db.doc(`restaurants/${restaurantId}`);
  const restaurantData = (await restaurantRef.get()).data() || {};
  if (restaurantData.uid !== ownerUid) {
    throw new functions.https.HttpsError("permission-denied", "The user does not have an authority to perform this operation.");
  }
  if (newOrder.length === 0) {
    throw new functions.https.HttpsError("permission-denied", "Cannot be changed to an empty order.");
  }
  // check mo
  const menuRestaurantRef = restaurantData.groupId ? await getGroupRestautantRef(db, restaurantData.groupId) : restaurantRef;

  try {
    const orderRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}`);
    const order = (await orderRef.get()).data();
    if (!order) {
      throw new functions.https.HttpsError("invalid-argument", "This order does not exist.");
    }

    if (!utils.isEmpty(order.orderUpdatedAt) || order.status !== order_status.order_placed) {
      throw new functions.https.HttpsError("failed-precondition", "It is not possible to change the order.");
    }

    // generate new order
    order.id = orderId;
    const { updateOrderData, updateOptions, updateRawOptions } = getUpdateOrder(newOrder, order.order, order.options, order.rawOptions);

    // update price
    const baseData = {
      order: updateOrderData,
      rawOptions: updateRawOptions,
    };
    const { newOrderData, newItems, newPrices, food_sub_total, alcohol_sub_total } = await createNewOrderData(menuRestaurantRef, orderRef, baseData, multiple);

    const accountingResult = orderAccounting(restaurantData, food_sub_total, alcohol_sub_total, multiple);
    // was created new order data

    const postage = restaurantData.isEC ? await utils.get_restaurant_postage(db, restaurantId) : {};
    const shippingCost = restaurantData.isEC ? costCal(postage, order?.customerInfo?.prefectureId, accountingResult.total) : 0;

    const orderUpdateData = {
      order: newOrderData,
      menuItems: newItems,
      prices: newPrices,
      options: updateOptions,
      rawOptions: updateRawOptions,
      sub_total: accountingResult.sub_total,
      tax: accountingResult.tax,
      inclusiveTax: accountingResult.inclusiveTax,
      total: accountingResult.total,
      totalCharge: accountingResult.total + (Number(order.tip) || 0) + (shippingCost || 0),
      shippingCost,
      accounting: {
        food: {
          revenue: accountingResult.food_sub_total,
          tax: accountingResult.food_tax,
        },
        alcohol: {
          revenue: accountingResult.alcohol_sub_total,
          tax: accountingResult.alcohol_tax,
        },
      },
      orderUpdatedAt: admin.firestore.Timestamp.now(),
    };

    if (!order.payment) {
      console.error("[orderChange] no payment", orderUpdateData);
      orderRef.update(orderUpdateData);
    } else {
      // update stripe
      await db.runTransaction(async (transaction) => {
        const customerUid = order.uid;
        const restaurantOwnerUid = restaurantData["uid"];
        const stripeAccount = await getStripeAccount(db, restaurantOwnerUid);

        const stripeRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}/system/stripe`);
        await getStripeOrderRecord(transaction, stripeRef);

        (await transaction.get(orderRef)).data();

        // get System Stripe
        const payment_method_data = await getPaymentMethodData(db, restaurantOwnerUid, customerUid);

        const description = `#${order.number} ${restaurantData.restaurantName} ${order.phoneNumber}`;
        const request = {
          setup_future_usage: "off_session",
          amount: orderUpdateData.totalCharge * multiple,
          description: `${description} ${orderId} orderChange`,
          currency: utils.getStripeRegion().currency,
          metadata: { uid: customerUid, restaurantId, orderId },
          payment_method_data,
        } as Stripe.PaymentIntentCreateParams;
        const hash = getHash(JSON.stringify(newOrderData));

        const paymentIntent = await stripe.paymentIntents.create(request, {
          idempotencyKey: orderRef.path + hash,
          stripeAccount,
        });

        await transaction.update(orderRef, orderUpdateData);

        await transaction.set(
          stripeRef,
          {
            paymentIntent,
          },
          { merge: true }
        );
        return {};
      });
    }
    if (order.sendSMS) {
      await sendMessageToCustomer(db, lng, "msg_order_updated", restaurantData.restaurantName, order, restaurantId, orderId, {}, true);
    }
    return {};
  } catch (error) {
    throw utils.process_error(error);
  }
};
