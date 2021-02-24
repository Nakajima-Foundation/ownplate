import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin';
import { order_status } from '../common/constant'
import Stripe from 'stripe'
import Order from '../models/Order'
import * as utils from '../lib/utils'
import { updateOrderTotalData } from '../functions/order';

import { sendMessageToCustomer, notifyNewOrderToRestaurant, notifyCanceledOrderToRestaurant } from '../functions/notify';

import moment from 'moment-timezone';

// This function is called by user to create a "payment intent" (to start the payment transaction)
export const create = async (db: FirebaseFirestore.Firestore, data: any, context: functions.https.CallableContext) => {
  const uid = utils.validate_auth(context);
  const stripe = utils.get_stripe();

  const { orderId, restaurantId, paymentMethodId, description, tip, sendSMS, timeToPickup, lng, memo } = data;
  utils.validate_params({ orderId, restaurantId }); // lng, paymentMethodId, tip and sendSMS are optional

  const restaurantData = await utils.get_restaurant(db, restaurantId);
  const venderId = restaurantData['uid']

  const paymentSnapshot = await db.doc(`/admins/${venderId}/public/payment`).get()
  const stripeAccount = paymentSnapshot.data()?.stripe
  if (!stripeAccount) {
    throw new functions.https.HttpsError('invalid-argument', 'This restaurant does not support payment.')
  }

  try {
    let orderNumber: number = 0;
    const result = await db.runTransaction(async transaction => {

      const orderRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}`)
      const stripeRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}/system/stripe`)
      const snapshot = await transaction.get(orderRef)
      const order = Order.fromSnapshot<Order>(snapshot)
      orderNumber = order.number;

      // Check the stock status.
      if (order.status !== order_status.validation_ok) {
        throw new functions.https.HttpsError('aborted', 'This order is invalid.')
      }

      const multiple = utils.getStripeRegion().multiple; // 100 for USD, 1 for JPY
      const totalCharge = Math.round((order.total + Math.max(0, tip)) * multiple)

      const request = {
        setup_future_usage: 'off_session',
        amount: totalCharge,
        description: `${description} ${orderId}`,
        currency: utils.getStripeRegion().currency,
        metadata: { uid, restaurantId, orderId }
      } as Stripe.PaymentIntentCreateParams

      if (paymentMethodId) {
        // This code is obsolete, but keep it for a while in case we need it.
        request.payment_method = paymentMethodId
      } else {
        // If no paymentMethodId, we expect that there is a customer Id associated with a token
        const refStripe = db.doc(`/users/${uid}/system/stripe`)
        const stripeInfo = (await refStripe.get()).data();
        if (!stripeInfo) {
          throw new functions.https.HttpsError('aborted', 'No stripeInfo.')
        }
        const token = await stripe.tokens.create({
          customer: stripeInfo.customerId
        }, {
          stripeAccount: stripeAccount
        })
        request["payment_method_data"] = {
          type: "card",
          card: {
            token: token.id
          }
        };
      }

      const paymentIntent = await stripe.paymentIntents.create(request, {
        idempotencyKey: orderRef.path,
        stripeAccount
      })

      const timePlaced = timeToPickup && new admin.firestore.Timestamp(timeToPickup.seconds, timeToPickup.nanoseconds) || admin.firestore.FieldValue.serverTimestamp()
      await updateOrderTotalData(db, transaction, order.order, restaurantId, uid, timePlaced, true);
      transaction.set(orderRef, {
        timePlaced,
        status: order_status.order_placed,
        updatedAt: admin.firestore.Timestamp.now(),
        orderPlacedAt: admin.firestore.Timestamp.now(),
        totalCharge: totalCharge / multiple,
        tip: Math.round(tip * multiple) / multiple,
        sendSMS: sendSMS || false,
        description: request.description,
        memo: memo || "",
        payment: {
          stripe: "pending"
        }
      }, { merge: true });

      transaction.set(stripeRef, {
        paymentIntent
      }, { merge: true });

      return {
        success: true
      }
    })

    await notifyNewOrderToRestaurant(db, restaurantId, orderId, restaurantData.restaurantName, orderNumber, lng);

    return result;
  } catch (error) {
    throw utils.process_error(error)
  }
};

// This function is called by admin to confurm a "payment intent" (to complete the payment transaction)
// ready_to_pickup
export const confirm = async (db: FirebaseFirestore.Firestore, data: any, context: functions.https.CallableContext) => {
  const uid = utils.validate_auth(context);
  const stripe = utils.get_stripe();

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
  const paymentSnapshot = await db.doc(`/admins/${venderId}/public/payment`).get()
  const stripeAccount = paymentSnapshot.data()?.stripe
  if (!stripeAccount) {
    throw new functions.https.HttpsError('invalid-argument', 'This restaurant does not support payment.')
  }

  if (venderId !== uid) {
    throw new functions.https.HttpsError('permission-denied', 'You do not have permission to confirm this request.')
  }

  let order: Order | undefined = undefined;

  try {
    const result = await db.runTransaction(async transaction => {

      const snapshot = await transaction.get(orderRef)
      order = Order.fromSnapshot<Order>(snapshot)

      if (!snapshot.exists) {
        throw new functions.https.HttpsError('invalid-argument', `The order does not exist. ${orderRef.path}`)
      }
      // Check the stock status.
      if (order.status !== order_status.cooking_completed // backward compability (99.99% unnecessary)
        && order.status !== order_status.order_accepted) {
        throw new functions.https.HttpsError('failed-precondition', 'This order is not ready yet.')
      }

      const stripeRecord = (await transaction.get(stripeRef)).data();
      if (!stripeRecord || !stripeRecord.paymentIntent || !stripeRecord.paymentIntent.id) {
        throw new functions.https.HttpsError('failed-precondition', 'This order has no paymentIntendId.', stripeRecord)
      }
      const paymentIntentId = stripeRecord.paymentIntent.id;

      // Check the stock status.
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
        idempotencyKey: order.id,
        stripeAccount
      })
      transaction.set(orderRef, {
        timeConfirmed: admin.firestore.FieldValue.serverTimestamp(),
        status: order_status.ready_to_pickup,
        updatedAt: admin.firestore.Timestamp.now(),
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
export const cancel = async (db: FirebaseFirestore.Firestore, data: any, context: functions.https.CallableContext) => {
  const uid = utils.validate_auth(context);
  const stripe = utils.get_stripe();

  const { restaurantId, orderId, lng } = data
  utils.validate_params({ restaurantId, orderId }) // lng is optional

  const orderRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}`)
  const stripeRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}/system/stripe`)
  const restaurant = await utils.get_restaurant(db, restaurantId)
  const venderId = restaurant['uid']

  const paymentSnapshot = await db.doc(`/admins/${venderId}/public/payment`).get()
  const stripeAccount = paymentSnapshot.data()?.stripe

  let sendSMS: boolean = false
  let phoneNumber: string | undefined = undefined;
  let orderNumber: number = 0;
  let uidUser: string | null = null;

  try {
    const result = await db.runTransaction(async transaction => {

      const snapshot = await transaction.get(orderRef)
      const order = Order.fromSnapshot<Order>(snapshot)

      if (!snapshot.exists) {
        throw new functions.https.HttpsError('invalid-argument', `The order does not exist.`)
      }

      if (uid === order.uid) {
        // User can cancel an order before accepted
        if (order.status !== order_status.order_placed) {
          throw new functions.https.HttpsError('permission-denied', 'Invalid order state to cancel.')
        }
      } else if (uid === venderId) {
        // Admin can cancel it before confirmed
        if (order.status >= order_status.ready_to_pickup) {
          throw new functions.https.HttpsError('permission-denied', 'Invalid order state to cancel.')
        }
        sendSMS = order.sendSMS
      } else {
        throw new functions.https.HttpsError('permission-denied', 'The user does not have permission to cancel this request.')
      }
      const cancelTimeKey = (uid === order.uid) ? "orderCustomerCanceledAt" : "orderRestaurantCanceledAt";

      phoneNumber = order.phoneNumber
      uidUser = order.uid
      orderNumber = order.number;

      if (!stripeAccount || !order.payment || !order.payment.stripe) {
        // No payment transaction
        await updateOrderTotalData(db, transaction, order.order, restaurantId, uid, order.timePlaced, false);
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
      const paymentIntentId = stripeRecord.paymentIntent.id;

      try {
        // Check the stock status.
        const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId, {
          idempotencyKey: `${order.id}-cancel`,
          stripeAccount
        })
        await updateOrderTotalData(db, transaction, order.order, restaurantId, restaurant.uid, order.timePlaced, false);
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
    const orderName = utils.nameOfOrder(orderNumber)
    if (sendSMS) {
      await sendMessageToCustomer(db, lng, 'msg_order_canceled', restaurant.restaurantName, orderName, uidUser, phoneNumber, restaurantId, orderId)
    }
    if (uid !== venderId) {
      await notifyCanceledOrderToRestaurant(db, restaurantId, orderId, restaurant.restaurantName, orderNumber, lng)
    }
    return result
  } catch (error) {
    throw utils.process_error(error)
  }
};
