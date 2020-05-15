import * as functions from 'firebase-functions'
import * as utils from '../stripe/utils'
import * as https from 'https'
import * as url from 'url';
import * as admin from 'firebase-admin';

const request = (_url: string, _options: any, postData?: any): Promise<any> => {
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

const postForm = (_url: string, params: any): Promise<any> => {
  const postData = Object.keys(params).map(key => {
    return key + "=" + encodeURIComponent(params[key]);
  }).join("&");
  return request(_url, {
    method: "POST",
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    }
  }, postData)
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

  try {
    // access_token, id_token, expires_in, refresh_token, scope, token_type
    const result = await postForm("https://api.line.me/oauth2/v2.1/token", params)
    // amr, aud, exp, iat, iss, name, sub
    const verified = await postForm('https://api.line.me/oauth2/v2.1/verify', {
      id_token: result.id_token,
      client_id
    })
    const customeToken = await admin.auth().createCustomToken(`line:${verified.sub}`)

    return { result, verified, customeToken };
  } catch (error) {
    throw utils.process_error(error)
  }
}
