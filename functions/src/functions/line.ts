import * as functions from 'firebase-functions'
import * as utils from '../stripe/utils'
import * as netutils from '../lib/netutils'
import * as admin from 'firebase-admin'

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
    const result = await netutils.postForm("https://api.line.me/oauth2/v2.1/token", params)
    if (!result.id_token) {
      throw new functions.https.HttpsError('invalid-argument',
        'Validation failed.', { params: result }
      )
    }
    // amr, aud, exp, iat, iss, name, sub
    const verified = await netutils.postForm('https://api.line.me/oauth2/v2.1/verify', {
      id_token: result.id_token,
      client_id
    })
    if (!verified.sub) {
      throw new functions.https.HttpsError('invalid-argument',
        'Verification failed.', { params: verified }
      )
    }
    const customeToken = await admin.auth().createCustomToken(`line:${verified.sub}`)

    return { result, verified, customeToken };
  } catch (error) {
    throw utils.process_error(error)
  }
}
