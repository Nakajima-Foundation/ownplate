import * as functions from 'firebase-functions'
import * as utils from '../stripe/utils'
import * as constant from '../common/constant'

export const update = async (db: FirebaseFirestore.Firestore, data: any, context: functions.https.CallableContext) => {
  const uid = utils.validate_auth(context);
  const { restaurantId, orderId, status } = data;
  utils.validate_params({ restaurantId, orderId, status })

  try {
    const restaurantDoc = await db.doc(`restaurants/${restaurantId}`).get()
    const restaurant = restaurantDoc.data() || {}
    if (restaurant.uid !== uid) {
      throw new functions.https.HttpsError('permission-denied', 'The user does not have an authority to perform this operation.')
    }

    // BUGBUG: We need to add some rules
    const orderRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}`)

    return await db.runTransaction(async transaction => {
      const snapshot = await transaction.get(orderRef);
      const order = snapshot.data();
      if (!order) {
        throw new functions.https.HttpsError('invalid-argument', 'This order does not exist.')
      }

      if (order.status < constant.order_status.validation_ok || order.status >= constant.order_status.customer_picked_up) {
        throw new functions.https.HttpsError('failed-precondition', 'It is not possible to change state from the current state.')
      }
      const isNewStatusValid: Boolean = (() => {
        switch (status) {
          case constant.order_status.order_canceled:
          case constant.order_status.order_accepted:
          case constant.order_status.cooking_completed:
            return true
        }
        return false
      })();
      if (!isNewStatusValid) {
        throw new functions.https.HttpsError('permission-denied', 'The user does not have an authority to perform this operation.')
      }

      transaction.update(orderRef, {
        status
      })
      return { success: true }
    })
  } catch (error) {
    throw utils.process_error(error)
  }
}
