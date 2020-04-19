import * as functions from 'firebase-functions';
//import * as constant from '../common/constant';

export const update = async (db: FirebaseFirestore.Firestore, data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.')
  }
  const { restaurantId, orderId, status } = data;
  if (!restaurantId || !orderId || !status) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing parameters.')
  }

  try {
    const uid: string = context.auth.uid
    const restaurantDoc = await db.doc(`restaurants/${restaurantId}`).get()
    const restaurant = restaurantDoc.data() || {}
    if (restaurant.uid !== uid) {
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
