import * as functions from 'firebase-functions'
import * as utils from '../stripe/utils'


export const process = async (db: FirebaseFirestore.Firestore, data: any, context: functions.https.CallableContext) => {
  const uid = utils.validate_auth(context);
  return { result: uid }
}
