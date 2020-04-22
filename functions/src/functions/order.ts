import * as functions from 'firebase-functions';
import * as utils from '../stripe/utils'

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
    await orderRef.update({
      status
    })

    return { success: true }
  } catch (error) {
    throw utils.process_error(error)
  }
}
