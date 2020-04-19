import * as functions from 'firebase-functions';
//import * as constant from '../common/constant';

export const update = async (db: FirebaseFirestore.Firestore, data: any, context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.')
  }
  const { restaurantId, orderId, status } = data;
  if (!restaurantId || !orderId || !status) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing parameter(s).')
  }

  try {
    const restaurantDoc = await db.doc(`restaurants/${restaurantId}`).get()
    const restaurant = restaurantDoc.data() || {}
    if (restaurant.uid !== context.auth.uid) {
      throw new functions.https.HttpsError('failed-precondition', 'The user does not have an authority to perform this operation.')
    }

    await db.doc(`restaurants/${restaurantId}/orders/${orderId}`).set({
      status
    }, { merge: true })

    return { success: true }
  } catch (error) {
    console.error(error);
    if (error instanceof functions.https.HttpsError) {
      throw error
    }
    throw new functions.https.HttpsError("internal", error.message, error);
  }
}
