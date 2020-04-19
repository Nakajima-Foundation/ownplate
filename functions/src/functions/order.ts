import * as functions from 'firebase-functions';
//import * as constant from '../common/constant';

export const update = async (db: FirebaseFirestore.Firestore, data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.')
  }
  const { restaurantId, orderId } = data;
  if (!restaurantId || !orderId) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing parameters.')
  }
  const orderRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}`)
  const orderDoc = await orderRef.get();
  const order = orderDoc.data();
  return { result: { success: order } }
}
