import * as functions from 'firebase-functions'
import * as utils from '../lib/utils'

export const deleteAccount = async (db: FirebaseFirestore.Firestore, data: any, context: functions.https.CallableContext) => {
  const uid = utils.validate_auth(context);

  try {
    return { result: uid }
  } catch (error) {
    throw utils.process_error(error)
  }
}
