import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin';
import { order_status } from '../common/constant'
import Stripe from 'stripe'
import Order from '../models/Order'
import * as utils from './utils'

// This function is called by user to create a "payment intent" (to start the payment transaction)
export const create = async (db: FirebaseFirestore.Firestore, data: any, context: functions.https.CallableContext) => {
  const uid = utils.validate_auth(context);
  const stripe = utils.get_stripe();

  const { orderId, restaurantId, paymentMethodId, tip } = data;
  utils.validate_params({ orderId, restaurantId, paymentMethodId });

  const restaurantData = await utils.get_restaurant(db, restaurantId);
  const venderId = restaurantData['uid']

  const stripeSnapshot = await db.doc(`/admins/${venderId}/public/stripe`).get()
  const stripeData = stripeSnapshot.data()
  if (!stripeData) {
    throw new functions.https.HttpsError('invalid-argument', 'This restaurant is unavailable.')
  }
  const stripeAccount = stripeData.stripeAccount
  try {
    return await db.runTransaction(async transaction => {

      const orderRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}`)
      const stripeRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}/system/stripe`)
      const snapshot = await transaction.get(orderRef)
      const order = Order.fromSnapshot<Order>(snapshot)

      // Check the stock status.
      if (order.status !== order_status.validation_ok) {
        throw new functions.https.HttpsError('aborted', 'This order is invalid.')
      }

      const multiple = utils.stripe_region.multiple; // 100 for USD, 1 for JPY
      const totalCharge = Math.round((order.total + Math.max(0, tip)) * multiple)

      const request = {
        setup_future_usage: 'off_session',
        amount: totalCharge,
        currency: utils.stripe_region.currency,
        payment_method: paymentMethodId,
        metadata: { uid, restaurantId, orderId }
      } as Stripe.PaymentIntentCreateParams

      if (data.description) {
        request.description = data.description
      }

      const paymentIntent = await stripe.paymentIntents.create(request, {
        idempotencyKey: orderRef.path,
        stripeAccount
      })

      transaction.set(orderRef, {
        timePlaced: admin.firestore.FieldValue.serverTimestamp(),
        status: order_status.order_placed,
        totalCharge: totalCharge / multiple,
        tip: Math.round(tip * multiple) / multiple,
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
  } catch (error) {
    throw utils.process_error(error)
  }
};

// This function is called by admin to confurm a "payment intent" (to complete the payment transaction)
export const confirm = async (db: FirebaseFirestore.Firestore, data: any, context: functions.https.CallableContext) => {
  const uid = utils.validate_auth(context);
  const stripe = utils.get_stripe();

  const { restaurantId, orderId } = data
  utils.validate_params({ restaurantId, orderId })

  const orderRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}`)
  const stripeRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}/system/stripe`)
  const restaurantSnapshot = await orderRef.parent.parent!.get()
  const restaurantData = restaurantSnapshot.data()
  if (!restaurantData) {
    throw new functions.https.HttpsError('invalid-argument', 'Dose not exist a restaurant.')
  }
  const venderId = restaurantData['uid']
  const stripeSnapshot = await db.doc(`/admins/${venderId}/public/stripe`).get()
  const stripeData = stripeSnapshot.data()
  if (!stripeData) {
    throw new functions.https.HttpsError('invalid-argument', 'This restaurant does not support payment.')
  }
  const stripeAccount = stripeData.stripeAccount

  if (venderId !== uid) {
    throw new functions.https.HttpsError('permission-denied', 'You do not have permission to confirm this request.')
  }

  try {
    return await db.runTransaction(async transaction => {

      const snapshot = await transaction.get(orderRef)
      const order = Order.fromSnapshot<Order>(snapshot)

      if (!snapshot.exists) {
        throw new functions.https.HttpsError('invalid-argument', `The order does not exist. ${orderRef.path}`)
      }
      // Check the stock status.
      if (order.status !== order_status.cooking_completed) {
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
        status: order_status.customer_picked_up,
        payment: {
          stripe: "confirmed"
        }
      }, { merge: true })
      transaction.set(stripeRef, {
        paymentIntent
      }, { merge: true });

      return { success: true }
    })
  } catch (error) {
    throw utils.process_error(error)
  }
};

// This function is called by user or admin to cencel an exsting order (before accepted by admin)
export const cancel = async (db: FirebaseFirestore.Firestore, data: any, context: functions.https.CallableContext) => {
  const uid = utils.validate_auth(context);
  const stripe = utils.get_stripe();

  const { restaurantId, orderId } = data
  utils.validate_params({ restaurantId, orderId })

  const orderRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}`)
  const stripeRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}/system/stripe`)
  const restaurantData = await utils.get_restaurant(db, restaurantId)
  const venderId = restaurantData['uid']

  const stripeSnapshot = await db.doc(`/admins/${venderId}/public/stripe`).get()
  const stripeData = stripeSnapshot.data()
  if (!stripeData) {
    throw new functions.https.HttpsError('invalid-argument', 'This restaurant is unavailable.')
  }

  const stripeAccount = stripeData.stripeAccount
  try {
    return await db.runTransaction(async transaction => {

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
        if (order.status >= order_status.customer_picked_up) {
          throw new functions.https.HttpsError('permission-denied', 'Invalid order state to cancel.')
        }
      } else {
        throw new functions.https.HttpsError('permission-denied', 'The user does not have permission to cancel this request.')
      }

      if (!order.payment || !order.payment.stripe) {
        // No payment transaction
        transaction.set(orderRef, {
          timeCanceld: admin.firestore.FieldValue.serverTimestamp(),
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
        transaction.set(orderRef, {
          timeCanceld: admin.firestore.FieldValue.serverTimestamp(),
          status: order_status.order_canceled,
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
  } catch (error) {
    throw utils.process_error(error)
  }
};
