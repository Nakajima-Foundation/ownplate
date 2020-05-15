import * as functions from 'firebase-functions'
import * as utils from '../stripe/utils'
import * as https from 'https'

export const validate = async (db: FirebaseFirestore.Firestore, data: any, context: functions.https.CallableContext) => {
  const { token } = data;
  utils.validate_params({ token })

  // https://stackoverflow.com/questions/43486393/how-to-make-an-http-request-in-cloud-functions-for-firebase
  try {
    return new Promise((resolve, reject) => {
      /*
      const options = {
        url: 'https://api.line.me/v1/oauth/verify',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      */
      https.get('https://api.line.me/oauth2/v2.1/token', (res) => {
        console.log('statusCode:', res.statusCode);
        console.log('headers:', res.headers);

        let body = "";
        res.on('data', (d) => {
          console.log(d);
          body += d;
        });
        res.on('end', () => {
          resolve({ success: true, body })
        })
      }).on('error', (e) => {
        console.error(e);
        reject({ error: e });
      });
      /*
      const options = {
        //url: 'https://api.line.me/v1/oauth/verify',
        hostname: 'api.line.me',
        port: 80,
        path: '/v1/oauth/verify',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      try {
        https.request(options, (res) => {
          resolve({ success: true, res });
        });
      } catch (error) {
        reject({ error });
      }
      */
    })
  } catch (error) {
    throw utils.process_error(error)
  }
}
