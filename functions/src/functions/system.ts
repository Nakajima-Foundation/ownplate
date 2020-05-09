import * as functions from 'firebase-functions'
import * as utils from '../stripe/utils'

export const getConfig = async (db: FirebaseFirestore.Firestore, data: any, context: functions.https.CallableContext) => {
  return {
    region: utils.getRegion()
  }
}
