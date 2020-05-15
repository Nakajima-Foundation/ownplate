import * as functions from 'firebase-functions'
import * as utils from '../stripe/utils'
import * as https from 'https'
import * as url from 'url';

export const validate = async (db: FirebaseFirestore.Firestore, data: any, context: functions.https.CallableContext) => {
  const { token } = data;
  utils.validate_params({ token })
  const foo = url.parse("https://api.line.me/oauth2/v2.1/token");

  // https://stackoverflow.com/questions/43486393/how-to-make-an-http-request-in-cloud-functions-for-firebase
  try {
    return new Promise((resolve, reject) => {
      const req = https.request(foo.href!, (res) => {
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
      })
      req.on('error', (e) => {
        console.error(e);
        reject({ error: e });
      });
      //req.write(postData)
      req.end();

      /*
      const options = {
        url: 'https://api.line.me/v1/oauth/verify',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      */
      //const postData = "hello";
      /*
      const options = {
        // https://api.line.me/oauth2/v2.1/token works with get
        //url: 'https://api.line.me/v2/oauth/accessToken',
        hostname: 'encrypted.google.com',
        port: 443,
        path: '/',
        method: 'GET'
        /*
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData)
        }
        */
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
