import * as functions from 'firebase-functions'
import * as utils from '../stripe/utils'
//import * as https from 'https'

export const validate = async (db: FirebaseFirestore.Firestore, data: any, context: functions.https.CallableContext) => {
  const { token } = data;
  utils.validate_params({ token })

  try {
    return new Promise((resolve) => {
      /*
  const options = {
    url: 'https://api.line.me/v1/oauth/verify',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
      https.request(options, (res) => {
        resolve({ success: true, res });
      });
      */
      resolve({ success: true })
    })
  } catch (error) {
    throw utils.process_error(error)
  }
}
