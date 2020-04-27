import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin';
import * as utils from '../stripe/utils'
import * as constant from '../common/constant'
import * as sms from './sms'
import * as lang from '../lang/resouces'
import i18next from 'i18next'
import Order from '../models/Order'

// This function is called by users to place orders without paying
export const place = async (db: FirebaseFirestore.Firestore, data: any, context: functions.https.CallableContext) => {
  const uid = utils.validate_auth(context);
  const { restaurantId, orderId, tip } = data;
  utils.validate_params({ restaurantId, orderId })

  try {
    const orderRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}`)

    return await db.runTransaction(async transaction => {
      const order = Order.fromSnapshot<Order>(await transaction.get(orderRef))
      if (!order) {
        throw new functions.https.HttpsError('invalid-argument', 'This order does not exist.')
      }
      if (uid !== order.uid) {
        throw new functions.https.HttpsError('permission-denied', 'The user is not the owner of this order.')
      }
      if (order.status !== constant.order_status.validation_ok) {
        throw new functions.https.HttpsError('failed-precondition', 'The order has been already placed or canceled')
      }
      const multiple = utils.stripe_region.multiple; // 100 for USD, 1 for JPY
      const roundedTip = Math.round(tip * multiple) / multiple

      transaction.update(orderRef, {
        status: constant.order_status.order_placed,
        totalCharge: order.total + tip,
        tip: roundedTip,
        timePlaced: admin.firestore.FieldValue.serverTimestamp()
      })

      return { success: true }
    })
  } catch (error) {
    throw utils.process_error(error)
  }
}

// This function is called by admins (restaurant operators) to update the status of order
export const update = async (db: FirebaseFirestore.Firestore, data: any, context: functions.https.CallableContext) => {
  const uid = utils.validate_auth(context);
  const { restaurantId, orderId, status, sendSms, lng } = data;
  utils.validate_params({ restaurantId, orderId, status }) // sendSms, lng is optional

  try {
    const restaurantDoc = await db.doc(`restaurants/${restaurantId}`).get()
    const restaurant = restaurantDoc.data() || {}
    if (restaurant.uid !== uid) {
      throw new functions.https.HttpsError('permission-denied', 'The user does not have an authority to perform this operation.')
    }

    const orderRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}`)
    let phoneNumber: string | undefined = undefined;

    const result = await db.runTransaction(async transaction => {
      const order = Order.fromSnapshot<Order>(await transaction.get(orderRef))
      if (!order) {
        throw new functions.https.HttpsError('invalid-argument', 'This order does not exist.')
      }
      phoneNumber = order.phoneNumber

      const isPreviousStateChangable: Boolean = (() => {
        switch (order.status) {
          case constant.order_status.order_placed:
          case constant.order_status.order_accepted:
          case constant.order_status.cooking_completed:
            return true
        }
        return false
      })();
      if (!isPreviousStateChangable) {
        throw new functions.https.HttpsError('failed-precondition', 'It is not possible to change state from the current state.', order.status)
      }

      const isNewStatusValid: Boolean = (() => {
        switch (status) {
          //case constant.order_status.order_canceled:    call stripeCancelIntent instead
          case constant.order_status.order_accepted:
          case constant.order_status.cooking_completed:
            return true
          case constant.order_status.customer_picked_up:
            return !(order.payment && order.payment.stripe) // only "unpaid" order can be manually completed
        }
        return false
      })();
      if (!isNewStatusValid) {
        throw new functions.https.HttpsError('permission-denied', 'The user does not have an authority to perform this operation.', status)
      }

      if (status === constant.order_status.order_canceled && order.payment && order.payment.stripe) {
        throw new functions.https.HttpsError('permission-denied', 'Paid order can not be cancele like this', status)
      }

      transaction.update(orderRef, {
        status
      })
      return { success: true }
    })
    if (sendSms) {
      const t = await i18next.init({
        lng: lng || "en",
        resources: lang.resources
      })
      await sms.pushSMS("OwnPlate", t("hello"), phoneNumber)
    }
    return result
  } catch (error) {
    throw utils.process_error(error)
  }
}
