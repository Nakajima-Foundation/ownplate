import * as functions from 'firebase-functions'
import * as utils from '../lib/utils'
import * as crypto from "crypto";

export const process = async (db: FirebaseFirestore.Firestore, data: any, context: functions.https.CallableContext) => {
  const uid = utils.validate_auth(context);
  const { eventId } = data;
  utils.validate_params({ eventId })
  const uidLine = context.auth!.token.line || uid
  let processed = false;

  try {
    //const refRecord = db.doc(`line/${uidLine}/records/${eventId}`);
    const hash = crypto
      .createHash("sha256")
      .update(uidLine)
      .digest("hex");
    const refRecord = db.doc(`hash/${hash}/records/${eventId}`);

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

    // Enter-Leave Pairing (leaving others as unprocessed)
    if (trace.event === "leave") {
      const refRecords = db.collection(`hash/${hash}/records/`);
      const records = (await refRecords.orderBy("timeCreated", "desc").limit(2).get()).docs;
      if (records.length === 2) {
        const lastDoc = records[1];
        const lastRecord = lastDoc.data();
        const duration = record.timeCreated.seconds - lastRecord.timeCreated.seconds;
        if (lastRecord.restaurantId === trace.restaurantId && lastRecord.event === "enter" && duration < 12 * 3600) {
          processed = true;
          await db.runTransaction(async tx => {
            tx.update(lastDoc.ref, {
              timeLeft: record.timeCreated,
              duration,
              processed
            })
            tx.update(refRecord, {
              processed
            })
          })
        }
      }
    }
    // Allows the system to reverse lookup
    const refProfile = db.doc(`hash/${hash}/system/profile`);
    const profile = (await refProfile.get()).data();
    if (!profile) {
      await refProfile.set({ uid: uidLine })
    }

    return { result: restaurant.restaurantName, processed }
  } catch (error) {
    throw utils.process_error(error)
  }
}
