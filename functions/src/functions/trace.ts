import * as functions from 'firebase-functions'
import * as utils from '../lib/utils'

export const process = async (db: FirebaseFirestore.Firestore, data: any, context: functions.https.CallableContext) => {
  const uid = utils.validate_auth(context);
  const { eventId } = data;
  utils.validate_params({ eventId })
  const uidLine = context.auth!.token.line || uid
  console.log("**** uid", uid, uidLine);

  try {
    const refRecord = db.doc(`line/${uidLine}/records/${eventId}`);
    const record = (await refRecord.get()).data();
    if (!record) {
      throw new functions.https.HttpsError('invalid-argument', 'No document for the specified eventId.')
    }
    const snapshot = await db
      .collectionGroup("trace")
      .limit(1)
      .where("traceId", "==", record.traceId)
      .get();
    if (snapshot.empty) {
      throw new functions.https.HttpsError('invalid-argument', 'No document for the specified traceId.')
    }
    const trace = snapshot.docs[0].data();
    const restaurant = (
      await db.doc(`restaurants/${trace.restaurantId}`).get()
    ).data();
    if (!restaurant) {
      throw new functions.https.HttpsError('invalid-argument', 'No document for the specified restaurantId.')
    }
    await refRecord.update({
      restaurantId: trace.restaurantId,
      event: trace.event,
      restaurantName: restaurant.restaurantName
    });
    return { result: restaurant.restaurantName }
  } catch (error) {
    throw utils.process_error(error)
  }

}
