import * as functions from 'firebase-functions'
import * as utils from '../lib/utils'
import * as admin from 'firebase-admin';

export const dispatch = async (db: FirebaseFirestore.Firestore, data: any, context: functions.https.CallableContext) => {
  if (!context.auth?.token?.admin) {
    throw new functions.https.HttpsError('permission-denied', 'You do not have permission to confirm this request.')
  }
  const { cmd, uid } = data;
  utils.validate_params({ cmd, uid });

  let result: object = { result: false, message: "not processed" };
  try {
    switch (cmd) {
      case "getCustomeClaims":
        result = await getCustomClaims(db, uid);
    }

    return result
  } catch (error) {
    throw utils.process_error(error)
  }
}

const getCustomClaims = async (db: FirebaseFirestore.Firestore, uid: string) => {
  const userRecord = await admin.auth().getUser(uid);
  const customClaims = userRecord.customClaims || {};
  return { result: customClaims }
}
