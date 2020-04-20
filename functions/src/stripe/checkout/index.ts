import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import * as constant from '../../common/constant'
import Stripe from 'stripe'
import Order from '../../models/Order'

export const create = async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.')
  }
  const STRIPE_SECRET_KEY = functions.config().stripe.secret_key
  if (!STRIPE_SECRET_KEY) {
    throw new functions.https.HttpsError('invalid-argument', 'The functions requires STRIPE_SECRET_KEY.')
  }
  console.info(data, context)
  const uid: string = context.auth.uid
  const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2020-03-02' })

  const orderId = data.orderId
  if (!orderId) {
    throw new functions.https.HttpsError('invalid-argument', 'This request does not include an orderId.')
  }
  const restaurantId = data.restaurantId
  if (!restaurantId) {
    throw new functions.https.HttpsError('invalid-argument', 'This request does not contain a restaurantId.')
  }
  const paymentMethodId = data.paymentMethodId
  if (!paymentMethodId) {
    throw new functions.https.HttpsError('invalid-argument', 'This request does not contain a paymentMethodId.')
  }

  const restaurantSnapshot = await admin.firestore().doc(`/restaurants/${restaurantId}`).get()
  const restaurantData = restaurantSnapshot.data()
  if (!restaurantData) {
    throw new functions.https.HttpsError('invalid-argument', 'Dose not exist a restaurant.')
  }
  const venderId = restaurantData['uid']
  const stripeSnapshot = await admin.firestore().doc(`/admins/${venderId}/public/stripe`).get()
  const stripeData = stripeSnapshot.data()
  if (!stripeData) {
    throw new functions.https.HttpsError('invalid-argument', 'This restaurant is unavailable.')
  }
  const stripeAccount = stripeData.stripeAccount
  try {
    const result = await admin.firestore().runTransaction(async transaction => {

      const orderRef = admin.firestore().doc(`restaurants/${restaurantId}/orders/${orderId}`)
      const snapshot = await transaction.get(orderRef)
      const order = Order.fromSnapshot<Order>(snapshot)

      // Check the stock status.
      if (order.status !== constant.order_status.validation_ok) {
        throw new functions.https.HttpsError('aborted', 'This order is invalid.')
      }

      // FIXME: check amount, currency.
      const amount = order.total * 100

      const request = {
        setup_future_usage: 'off_session',
        amount: amount,
        currency: 'USD',
        payment_method: paymentMethodId,
        metadata: { uid, restaurantId, orderId }
      } as Stripe.PaymentIntentCreateParams

      const paymentIntent = await stripe.paymentIntents.create(request, {
        idempotencyKey: orderRef.path,
        stripeAccount
      })

      transaction.set(orderRef, {
        timePaid: admin.firestore.FieldValue.serverTimestamp(),
        status: constant.order_status.customer_paid,
        result: paymentIntent
      }, { merge: true })

      return {
        paymentIntentId: paymentIntent.id,
        orderId: orderRef.id
      }
    })
    return { result }
  } catch (error) {
    console.error(error)
    if (error instanceof functions.https.HttpsError) {
      throw error
    }
    throw new functions.https.HttpsError("internal", error.message, error);
  }
};

export const confirm = async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.')
  }
  const STRIPE_SECRET_KEY = functions.config().stripe.secret_key
  if (!STRIPE_SECRET_KEY) {
    throw new functions.https.HttpsError('invalid-argument', 'The functions requires STRIPE_SECRET_KEY.')
  }
  console.info(data, context)
  const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2020-03-02' })

  const orderPath = data.orderPath
  if (!orderPath) {
    throw new functions.https.HttpsError('invalid-argument', 'This request does not include an orderPath.')
  }
  const paymentIntentID = data.paymentIntentId
  if (!paymentIntentID) {
    throw new functions.https.HttpsError('invalid-argument', 'This request does not contain a paymentIntentID.')
  }

  const orderRef = admin.firestore().doc(orderPath)
  const restaurantSnapshot = await orderRef.parent.parent!.get()
  const restaurantData = restaurantSnapshot.data()
  if (!restaurantData) {
    throw new functions.https.HttpsError('invalid-argument', 'Dose not exist a restaurant.')
  }
  const venderId = restaurantData['uid']
  const stripeSnapshot = await admin.firestore().doc(`/admins/${venderId}/public/stripe`).get()
  const stripeData = stripeSnapshot.data()
  if (!stripeData) {
    throw new functions.https.HttpsError('invalid-argument', 'This restaurant is unavailable.')
  }
  const stripeAccount = stripeData.stripeAccount

  try {
    const result = await admin.firestore().runTransaction(async transaction => {

      const snapshot = await transaction.get(orderRef)
      const order = Order.fromSnapshot<Order>(snapshot)

      if (!snapshot.exists) {
        throw new functions.https.HttpsError('invalid-argument', `The order does not exist. ${orderRef.path}`)
      }
      // Check the stock status.
      if (order.status !== constant.order_status.validation_ok) {
        throw new functions.https.HttpsError('aborted', 'This order is invalid.')
      }

      try {
        // Check the stock status.
        const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentID, {
          idempotencyKey: order.id,
          stripeAccount
        })
        transaction.set(orderRef, {
          timeConfirmed: admin.firestore.FieldValue.serverTimestamp(),
          status: constant.order_status.customer_paid,
          result: paymentIntent
        }, { merge: true })
        return paymentIntent
      } catch (error) {
        throw error
      }
    })
    return { result }
  } catch (error) {
    console.error(error)
    if (error instanceof functions.https.HttpsError) {
      throw error
    }
    throw new functions.https.HttpsError("internal", error.message, error);
  }
};


export const cancel = async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.')
  }
  const STRIPE_SECRET_KEY = functions.config().stripe.secret_key
  if (!STRIPE_SECRET_KEY) {
    throw new functions.https.HttpsError('invalid-argument', 'The functions requires STRIPE_SECRET_KEY.')
  }
  console.info(data, context)
  const uid = context.auth.uid
  const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2020-03-02' })

  const orderPath = data.orderPath
  if (!orderPath) {
    throw new functions.https.HttpsError('invalid-argument', 'This request does not include an orderPath.')
  }
  const paymentIntentId = data.paymentIntentId
  if (!paymentIntentId) {
    throw new functions.https.HttpsError('invalid-argument', 'This request does not contain a paymentIntentId.')
  }

  const orderRef = admin.firestore().doc(orderPath)
  const restaurantSnapshot = await orderRef.parent.parent!.get()
  const restaurantData = restaurantSnapshot.data()
  if (!restaurantData) {
    throw new functions.https.HttpsError('invalid-argument', 'Dose not exist a restaurant.')
  }
  const venderId = restaurantData['uid']
  const stripeSnapshot = await admin.firestore().doc(`/admins/${venderId}/public/stripe`).get()
  const stripeData = stripeSnapshot.data()
  if (!stripeData) {
    throw new functions.https.HttpsError('invalid-argument', 'This restaurant is unavailable.')
  }

  const stripeAccount = stripeData.stripeAccount
  try {
    const result = await admin.firestore().runTransaction(async transaction => {

      const snapshot = await transaction.get(orderRef)
      const order = Order.fromSnapshot<Order>(snapshot)

      if (!snapshot.exists) {
        throw new functions.https.HttpsError('invalid-argument', `The order does not exist. ${orderRef.path}`)
      }
      if (uid !== order.uid) {
        throw new functions.https.HttpsError('permission-denied', 'You do not have permission to cancel this request.')
      }
      if (order.status !== constant.order_status.customer_paid) {
        throw new functions.https.HttpsError('permission-denied', 'Invalid order state to cancel.')
      }

      try {
        // Check the stock status.
        const paymentIntents = await stripe.paymentIntents.cancel(paymentIntentId, {
          idempotencyKey: `${order.id}-cancel`,
          stripeAccount
        })
        transaction.set(orderRef, {
          timeCanceld: admin.firestore.FieldValue.serverTimestamp(),
          status: constant.order_status.order_canceled_by_customer,
          uidCanceledBy: uid,
          result: paymentIntents
        }, { merge: true })
        return paymentIntents
      } catch (error) {
        throw error
      }
    })
    return { result }
  } catch (error) {
    console.error(error)
    if (error instanceof functions.https.HttpsError) {
      throw error
    }
    throw new functions.https.HttpsError("internal", error.message, error);
  }
};
