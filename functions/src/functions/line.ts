import * as functions from 'firebase-functions'

export const validate = async (db: FirebaseFirestore.Firestore, data: any, context: functions.https.CallableContext) => {
  return { success: true }
}
