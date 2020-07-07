import * as functions from 'firebase-functions'

export const dispatch = async (db: FirebaseFirestore.Firestore, data: any, context: functions.https.CallableContext) => {
  if (!context.auth?.token?.admin) {
    throw new functions.https.HttpsError('permission-denied', 'You do not have permission to confirm this request.')
  }
  return {
    result: true
  }
}
