import * as functions from 'firebase-functions'

export const dispatch = async (db: FirebaseFirestore.Firestore, data: any, context: functions.https.CallableContext) => {
  return {
    result: true
  }
}
