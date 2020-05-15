import * as functions from 'firebase-functions'
import * as utils from '../stripe/utils'
import * as https from 'https'
import * as url from 'url';

export const validate = async (db: FirebaseFirestore.Firestore, data: any, context: functions.https.CallableContext) => {
  const { token } = data;
  utils.validate_params({ token })
  const foo = url.parse("https://api.line.me/oauth2/v2.1/token");

  const params = {
    grant_type: "authorization_code",
    code: token,
    redirect_uri: "http//localhost:3000/test/line",
    client_id: "1654216149",
    client_secret: "abc"
  };
  const postData = Object.keys(params).map(key => {
    return key + "=" + encodeURIComponent(params[key]);
  }).join("&");
  console.log(postData);

  const options = {
    hostname: foo.host,
    port: 443,
    path: foo.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    }
  }

  // https://stackoverflow.com/questions/43486393/how-to-make-an-http-request-in-cloud-functions-for-firebase
  try {
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        console.log('statusCode:', res.statusCode);
        console.log('headers:', res.headers);
        res.setEncoding('utf8');
        let body = "";
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          resolve({ success: true, body })
        })
      })
      req.on('error', (e) => {
        console.error(e);
        reject({ error: e });
      });
      req.write(postData)
      req.end();
    })
  } catch (error) {
    throw utils.process_error(error)
  }
}
