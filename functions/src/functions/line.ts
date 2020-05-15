import * as functions from 'firebase-functions'
import * as utils from '../stripe/utils'
import * as https from 'https'
import * as url from 'url';
/*
import * as jwt from 'jsonwebtoken';

const decode = (token: string, secret: string, options: any) => {
  return new Promise((resolve, reject) => {
    jwt.decode(token, secret, options, (err: any, decoded: any) => {
      if (err) {
        reject(err)
      } else {
        resolve(decoded)
      }
    })
  })
}
*/

const request = (_url: string, _options: any, postData?: any) => {
  const parsedURL = url.parse(_url);
  const options = Object.assign({
    hostname: parsedURL.host,
    port: 443,
    path: parsedURL.pathname,
    method: "GET"
  }, _options)
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      res.setEncoding('utf8');
      let body = "";
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve(JSON.parse(body))
      })
    })
    req.on('error', (e) => {
      console.error(e);
      reject({ error: e });
    });
    if (postData) {
      req.write(postData)
    }
    req.end();
  })
}

export const validate = async (db: FirebaseFirestore.Firestore, data: any, context: functions.https.CallableContext) => {
  const { code, redirect_uri, client_id } = data;
  utils.validate_params({ code, redirect_uri, client_id })

  const LINE_SECRET_KEY = functions.config().line.secret;
  const params = {
    grant_type: "authorization_code",
    code,
    redirect_uri,
    client_id,
    client_secret: LINE_SECRET_KEY
  };
  const postData = Object.keys(params).map(key => {
    return key + "=" + encodeURIComponent(params[key]);
  }).join("&");

  try {
    const result: any = await request("https://api.line.me/oauth2/v2.1/token", {
      method: "POST",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, postData)

    /*
    const decoded = await decode(result.id_token, LINE_SECRET_KEY, {
      audience: client_id,
      issuer: 'https://access.line.me',
      algorithms: ['HS256']
    })
    */

    return { result, decoded };
  } catch (error) {
    throw utils.process_error(error)
  }
}
