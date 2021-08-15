import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin';
import {
  order_status, next_transitions,
  order_status_keys, timeEventMapping
} from '../common/constant';
import Stripe from 'stripe'
import Order from '../models/Order'
import * as utils from '../lib/utils'
import {
  orderAccounting,
  createNewOrderData,
  updateOrderTotalDataAndUserLog
} from '../functions/order';

import { sendMessageToCustomer, notifyNewOrderToRestaurant, notifyCanceledOrderToRestaurant } from '../functions/notify';

import { Context } from '../models/TestType';

import moment from 'moment-timezone';
import * as crypto from "crypto";

const multiple = utils.getStripeRegion().multiple; // 100 for USD, 1 for JPY
const stripe = utils.get_stripe();

const getCustomerStripeInfo = async (db: any, customerUid: string) => {
  const refStripe = db.doc(`/users/${customerUid}/system/stripe`)
  const stripeInfo = (await refStripe.get()).data();
  if (!stripeInfo) {
    throw new functions.https.HttpsError('aborted', 'No stripeInfo.')
  }
  return stripeInfo;
};
const getStripeAccount = async (db: any, venderId: string) => {
  const paymentSnapshot = await db.doc(`/admins/${venderId}/public/payment`).get();
  const stripeAccount = paymentSnapshot.data()?.stripe
  if (!stripeAccount) {
    throw new functions.https.HttpsError('invalid-argument', 'This restaurant does not support payment.')
  }
  return stripeAccount;
}
const getPaymentMethodData = async (db: any, venderId: string, customerUid: string) => {
  const stripeAccount = await getStripeAccount(db, venderId);

  const stripeInfo = await getCustomerStripeInfo(db, customerUid);
  const token = await stripe.tokens.create({
    customer: stripeInfo.customerId
  }, {
    stripeAccount: stripeAccount
  })
  const paymentMethodData = {
    type: "card",
    card: {
      token: token.id
    }
  };
  return paymentMethodData;
};

// This function is called by user to create a "payment intent" (to start the payment transaction)
export const create = async (db: FirebaseFirestore.Firestore, data: any, context: functions.https.CallableContext) => {
  const customerUid = utils.validate_auth(context);

  const { orderId, restaurantId, description, tip, sendSMS, timeToPickup, lng, memo } = data;
  const _tip = Number(tip) || 0;
  utils.validate_params({ orderId, restaurantId }); // lng, tip and sendSMS are optional

  const restaurantData = await utils.get_restaurant(db, restaurantId);
  const venderId = restaurantData['uid']

  let order: Order | undefined = undefined;
  try {
    const result = await db.runTransaction(async transaction => {
      const stripeAccount = await getStripeAccount(db, venderId);

      const orderRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}`)
      const stripeRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}/system/stripe`)
      const snapshot = await transaction.get(orderRef)
      order = Order.fromSnapshot<Order>(snapshot)
      order.id = orderId;

      // Check the stock status.
      if (order.status !== order_status.validation_ok) {
        throw new functions.https.HttpsError('aborted', 'This order is invalid.')
      }

      const totalChargeWithTipAndMultipled = Math.round((order.total + Math.max(0, _tip)) * multiple)

      // We expect that there is a customer Id associated with a token
      const payment_method_data = await getPaymentMethodData(db, venderId, customerUid);

      const request = {
        setup_future_usage: 'off_session',
        amount: totalChargeWithTipAndMultipled,
        description: `${description} ${orderId}`,
        currency: utils.getStripeRegion().currency,
        metadata: { uid: customerUid, restaurantId, orderId },
        payment_method_data,
      } as Stripe.PaymentIntentCreateParams

      const paymentIntent = await stripe.paymentIntents.create(request, {
        idempotencyKey: orderRef.path,
        stripeAccount
      })

      const timePlaced = timeToPickup && new admin.firestore.Timestamp(timeToPickup.seconds, timeToPickup.nanoseconds) || admin.firestore.FieldValue.serverTimestamp()
      await updateOrderTotalDataAndUserLog(db, transaction, customerUid, order.order, restaurantId, customerUid, timePlaced, true);
      const updateData = {
        status: order_status.order_placed,
        totalCharge: totalChargeWithTipAndMultipled / multiple,
        tip: Math.round(_tip * multiple) / multiple,
        sendSMS: sendSMS || false,
        updatedAt: admin.firestore.Timestamp.now(),
        orderPlacedAt: admin.firestore.Timestamp.now(),
        timePlaced,
        description: request.description,
        memo: memo || "",
        payment: {
          stripe: "pending"
        }
      };
      transaction.set(orderRef, updateData, { merge: true });
      order = Object.assign(order, updateData);

      transaction.set(stripeRef, {
        paymentIntent
      }, { merge: true });

      return {
        success: true
      }
    })

    await notifyNewOrderToRestaurant(db, restaurantId, order, restaurantData.restaurantName, lng);

    return result;
  } catch (error) {
    throw utils.process_error(error)
  }
};

// This function is called by admin to confurm a "payment intent" (to complete the payment transaction)
// ready_to_pickup
export const confirm = async (db: FirebaseFirestore.Firestore, data: any, context: functions.https.CallableContext) => {
  const ownerUid = utils.validate_admin_auth(context);

  const { restaurantId, orderId, lng } = data
  utils.validate_params({ restaurantId, orderId }) // lng is optional

  const orderRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}`)
  const stripeRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}/system/stripe`)
  const restaurantSnapshot = await orderRef.parent.parent!.get()
  const restaurantData = restaurantSnapshot.data()
  if (!restaurantData) {
    throw new functions.https.HttpsError('invalid-argument', 'Dose not exist a restaurant.')
  }
  const venderId = restaurantData['uid']
  const stripeAccount = await getStripeAccount(db, venderId);

  if (venderId !== ownerUid) {
    throw new functions.https.HttpsError('permission-denied', 'You do not have permission to confirm this request.')
  }

  let order: Order | undefined = undefined;

  try {
    const result = await db.runTransaction(async transaction => {

      const snapshot = await transaction.get(orderRef)
      order = Order.fromSnapshot<Order>(snapshot)
      order.id = orderId;

      if (!snapshot.exists) {
        throw new functions.https.HttpsError('invalid-argument', `The order does not exist. ${orderRef.path}`)
      }
      // Check the stock status.
      // order.status !== order_status.cooking_completed // backward compability (99.99% unnecessary)
      if ( order.status !== order_status.order_placed // from 2021-07-17
        && order.status !== order_status.order_accepted) { // obsolete but backward compability
        throw new functions.https.HttpsError('failed-precondition', 'This order is not ready yet.')
      }
      if (!order.payment || (order.payment.stripe !== "pending")) {
        throw new functions.https.HttpsError('failed-precondition', 'Stripe process was done.')
      }

      const stripeRecord = (await transaction.get(stripeRef)).data();
      if (!stripeRecord || !stripeRecord.paymentIntent || !stripeRecord.paymentIntent.id) {
        throw new functions.https.HttpsError('failed-precondition', 'This order has no paymentIntendId.')
      }
      const nextStatus = next_transitions[order.status];

      const paymentIntentId = stripeRecord.paymentIntent.id;

      // Check the stock status.
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
        idempotencyKey: order.id,
        stripeAccount
      })

      const updateTimeKey = timeEventMapping[order_status_keys[nextStatus]];
      transaction.set(orderRef, {
        // timeConfirmed: admin.firestore.FieldValue.serverTimestamp(),
        status: nextStatus,
        [updateTimeKey]: admin.firestore.Timestamp.now(),
        payment: {
          stripe: "confirmed"
        }
      }, { merge: true })
      transaction.set(stripeRef, {
        paymentIntent
      }, { merge: true });

      return { success: true }
    })

    if (order && order!.sendSMS && order!.timeEstimated) {
      const diffDay =  (moment().toDate().getTime() - order!.timeEstimated.toDate().getTime()) / 1000 / 3600 / 24;
      console.log("timeEstimated_diff_days = " + String(diffDay));
      if (diffDay < 1) {
        const msgKey = "msg_cooking_completed"
        const orderName = utils.nameOfOrder(order!.number)
        await sendMessageToCustomer(db, lng, msgKey, restaurantData.restaurantName, orderName, order!.uid, order!.phoneNumber, restaurantId, orderId, {});
      }
    }

    return result
  } catch (error) {
    throw utils.process_error(error)
  }
};

// This function is called by user or admin to cencel an exsting order (before accepted by admin)
export const cancel = async (db: any, data: any, context: functions.https.CallableContext | Context) => {
  const isAdmin = utils.is_admin_auth(context);
  console.log("is_admin:" + String(isAdmin));

  const uid = isAdmin ? utils.validate_admin_auth(context) : utils.validate_auth(context);

  const { restaurantId, orderId, lng } = data
  utils.validate_params({ restaurantId, orderId }) // lng is optional

  const orderRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}`)
  const stripeRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}/system/stripe`)
  const restaurant = await utils.get_restaurant(db, restaurantId)
  const venderId = restaurant['uid']

  const stripeAccount = await getStripeAccount(db, venderId);

  let sendSMS: boolean = false
  let phoneNumber: string | undefined = undefined;
  let uidUser: string | null = null;
  let order: Order | undefined = undefined;

  try {
    const result = await db.runTransaction(async transaction => {

      const snapshot = await transaction.get(orderRef)
      order = Order.fromSnapshot<Order>(snapshot)

      if (!snapshot.exists) {
        throw new functions.https.HttpsError('invalid-argument', `The order does not exist.`)
      }

      if (isAdmin) {
        // Admin can cancel it before confirmed
        if (uid !== venderId || order.status >= order_status.ready_to_pickup) {
          throw new functions.https.HttpsError('permission-denied', 'Invalid order state to cancel.')
        }
        sendSMS = order.sendSMS
      } else {
        // User can cancel an order before accepted
        if (uid !== order.uid || order.status !== order_status.order_placed) {
          throw new functions.https.HttpsError('permission-denied', 'Invalid order state to cancel.')
        }
      }
      const cancelTimeKey = (uid === order.uid) ? "orderCustomerCanceledAt" : "orderRestaurantCanceledAt";

      phoneNumber = order.phoneNumber
      uidUser = order.uid

      if (!stripeAccount || !order.payment || !order.payment.stripe) {
        // No payment transaction
        await updateOrderTotalDataAndUserLog(db, transaction, uidUser, order.order, restaurantId, uid, order.timePlaced, false);
        transaction.set(orderRef, {
          timeCanceled: admin.firestore.FieldValue.serverTimestamp(),
          [cancelTimeKey]: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.Timestamp.now(),
          status: order_status.order_canceled,
          uidCanceledBy: uid,
        }, { merge: true })
        return { success: true, payment: false }
      }

      const stripeRecord = (await transaction.get(stripeRef)).data();
      if (!stripeRecord || !stripeRecord.paymentIntent || !stripeRecord.paymentIntent.id) {
        throw new functions.https.HttpsError('failed-precondition', 'This order has no paymentIntendId.', stripeRecord)
      }
      if (order.payment.stripe !== "pending") {
        throw new functions.https.HttpsError('permission-denied', 'Invalid payment state to cancel.')
      }
      const paymentIntentId = stripeRecord.paymentIntent.id;

      try {
        // Check the stock status.
        const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId, {
          idempotencyKey: `${order.id}-cancel`,
          stripeAccount
        })
        await updateOrderTotalDataAndUserLog(db, transaction, uidUser, order.order, restaurantId, restaurant.uid, order.timePlaced, false);
        transaction.set(orderRef, {
          timeCanceled: admin.firestore.FieldValue.serverTimestamp(),
          [cancelTimeKey]: admin.firestore.FieldValue.serverTimestamp(),
          status: order_status.order_canceled,
          updatedAt: admin.firestore.Timestamp.now(),
          uidCanceledBy: uid,
          payment: {
            stripe: "canceled"
          }
        }, { merge: true })
        transaction.set(stripeRef, {
          paymentIntent
        }, { merge: true });
        return { success: true, payment: "stripe", byUser: (uid === order.uid) }
      } catch (error) {
        throw error
      }
    })
    const orderName = utils.nameOfOrder(order!.number);
    if (sendSMS) {
      await sendMessageToCustomer(db, lng, 'msg_order_canceled', restaurant.restaurantName, orderName, uidUser, phoneNumber, restaurantId, orderId, {}, true)
    }
    if (uid !== venderId) {
      await notifyCanceledOrderToRestaurant(db, restaurantId, order, restaurant.restaurantName, lng)
    }
    return result
  } catch (error) {
    throw utils.process_error(error)
  }
};

// This function is called by admin to cencel an exsting order
export const cancelStripePayment = async (db: FirebaseFirestore.Firestore, data: any, context: functions.https.CallableContext | Context) => {
  const uid = utils.validate_admin_auth(context);

  const { restaurantId, orderId, lng } = data
  utils.validate_params({ restaurantId, orderId }) // lng is optional

  const orderRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}`)
  const stripeRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}/system/stripe`)
  const restaurant = await utils.get_restaurant(db, restaurantId)
  const venderId = restaurant['uid']

  const stripeAccount = await getStripeAccount(db, venderId);

  let order: Order | undefined = undefined;

  try {
    const result = await db.runTransaction(async transaction => {

      const snapshot = await transaction.get(orderRef)
      order = Order.fromSnapshot<Order>(snapshot)

      if (!snapshot.exists) {
        throw new functions.https.HttpsError('invalid-argument', `The order does not exist.`)
      }

      if (!stripeAccount || !order.payment || !order.payment.stripe) {
        throw new functions.https.HttpsError('permission-denied', 'Invalid order state to cancel payment.')
      }
      // Admin can cancel it before confirmed
      if (order.payment.stripe !== "pending") {
        throw new functions.https.HttpsError('permission-denied', 'Invalid payment state to cancel.')
      }

      const stripeRecord = (await transaction.get(stripeRef)).data();
      if (!stripeRecord || !stripeRecord.paymentIntent || !stripeRecord.paymentIntent.id) {
        throw new functions.https.HttpsError('failed-precondition', 'This order has no paymentIntendId.', stripeRecord)
      }
      const paymentIntentId = stripeRecord.paymentIntent.id;

      try {
        // Check the stock status.
        const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId, {
          idempotencyKey: `${order.id}-cancel`,
          stripeAccount
        })
        transaction.set(orderRef, {
          orderRestaurantPaymentCanceledAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.Timestamp.now(),
          uidPaymentCanceledBy: uid,
          payment: {
            stripe: "canceled"
          }
        }, { merge: true })
        transaction.set(stripeRef, {
          paymentIntent
        }, { merge: true });
        return { success: true, payment: "stripe" }
      } catch (error) {
        throw error
      }
    })
    const orderName = utils.nameOfOrder(order!.number);
    if (order!.sendSMS) {
      const phoneNumber = order!.phoneNumber;
      const uidUser = order!.uid;

      await sendMessageToCustomer(db, lng, 'msg_stripe_payment_canceled', restaurant.restaurantName, orderName, uidUser, phoneNumber, restaurantId, orderId, {}, true)
    }
    return result
  } catch (error) {
    throw utils.process_error(error)
  }
};

const getUpdateOrder = (newOrder, order, options, rawOptions) => {
  // console.log(newOrder, order, options, rawOptions);
  const updateOrderData = {};
  const updateOptions = {};
  const updateRawOptions = {};

  newOrder.forEach(data => {
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
    updateOrderData, updateOptions, updateRawOptions
  }
};
export const orderChange = async (db: any, data: any, context: functions.https.CallableContext | Context) => {
  const ownerUid = utils.validate_admin_auth(context);
  const { restaurantId, orderId, newOrder, timezone } = data;
  utils.validate_params({ restaurantId, orderId, newOrder, timezone }) // lng, timeEstimated is optional

  // get menu
  try {
    const restaurantRef = db.doc(`restaurants/${restaurantId}`)
    const restaurantData = (await restaurantRef.get()).data() || {}
    if (restaurantData.uid !== ownerUid) {
      throw new functions.https.HttpsError('permission-denied', 'The user does not have an authority to perform this operation.')
    }
    const orderRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}`)

    const order = (await orderRef.get()).data();

    if (!order) {
      throw new functions.https.HttpsError('invalid-argument', 'This order does not exist.')
    }
    order.id = orderId;
    const { updateOrderData, updateOptions, updateRawOptions } = getUpdateOrder(newOrder, order.order, order.options, order.rawOptions);

    // update price
    const baseData = {
      order: updateOrderData,
      rawOptions: updateRawOptions,
    };
    const { newOrderData, newItems, newPrices, food_sub_total, alcohol_sub_total } = await createNewOrderData(restaurantRef, orderRef, baseData, multiple);

    const accountingResult = orderAccounting(restaurantData, food_sub_total, alcohol_sub_total, multiple);
    // was created new order data

    const orderUpdateData = {
      order: newOrderData,
      menuItems: newItems, // Clone of ordered menu items (simplified)
      prices: newPrices,
      options: updateOptions,
      rawOptions: updateRawOptions,
      // status: order_status.validation_ok,
      // number: orderCount,
      sub_total: accountingResult.sub_total,
      tax: accountingResult.tax,
      inclusiveTax: accountingResult.inclusiveTax,
      total: accountingResult.total,
      totalCharge: accountingResult.total + (Number(order.tip) ||0),
      accounting: {
        food: {
          revenue: accountingResult.food_sub_total,
          tax: accountingResult.food_tax
        },
        alcohol: {
          revenue: accountingResult.alcohol_sub_total,
          tax: accountingResult.alcohol_tax
        }
      },
      orderUpdatedAt: admin.firestore.Timestamp.now(),
    };


    if (!order.payment) {
      orderRef.update(orderUpdateData);
    } else {
      // update stripe
      const result = await db.runTransaction(async transaction => {
        const customerUid = order.uid;
        const venderId = restaurantData['uid'];
        const stripeAccount = await getStripeAccount(db, venderId);
        const stripeRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}/system/stripe`);

        (await transaction.get(orderRef)).data();

        const stripeRecord = (await transaction.get(stripeRef)).data();
        if (!stripeRecord || !stripeRecord.paymentIntent || !stripeRecord.paymentIntent.id) {
          throw new functions.https.HttpsError('failed-precondition', 'This order has no paymentIntendId.')
        }

        // get System Stripe
        const payment_method_data = await getPaymentMethodData(db, venderId, customerUid);

        const description = `#${order.number} ${restaurantData.restaurantName} ${order.phoneNumber}`;
        const request = {
          setup_future_usage: 'off_session',
          amount: orderUpdateData.totalCharge * multiple,
          description: `${description} ${orderId} orderChange`,
          currency: utils.getStripeRegion().currency,
          metadata: { uid: customerUid, restaurantId, orderId },
          payment_method_data,
        } as Stripe.PaymentIntentCreateParams;

        const hash = crypto
          .createHash("sha256")
          .update(JSON.stringify(newOrderData))
          .digest("hex");

        const paymentIntent = await stripe.paymentIntents.create(request, {
          idempotencyKey: orderRef.path + hash,
          stripeAccount
        })

        await transaction.update(orderRef, orderUpdateData);

        await transaction.set(stripeRef, {
          paymentIntent
        }, { merge: true });
        return {};
      });
      console.log(result);
    }

    // send to customer

    return {};
  } catch (error) {
    throw utils.process_error(error)
  }
}
