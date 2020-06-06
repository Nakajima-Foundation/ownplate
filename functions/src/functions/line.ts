import * as functions from 'firebase-functions'
import * as utils from '../lib/utils'
import * as netutils from '../lib/netutils'
import { ownPlateConfig } from '../common/project';
import * as admin from 'firebase-admin';

export const isEnabled = !!ownPlateConfig.line;

export const setCustomClaim = async (db: FirebaseFirestore.Firestore, data: any, context: functions.https.CallableContext) => {
  const uid = utils.validate_auth(context);
  const isLine = uid.slice(0, 5) === "line:"
  try {
    if (isLine) {
      // This looks redundant, but it simplifies the firebase.rules
      await admin.auth().setCustomUserClaims(uid, {
        line: uid
      })
    }
    return { success: isLine }
  } catch (error) {
    throw utils.process_error(error)
  }
}

export const verifyFriend = async (db: FirebaseFirestore.Firestore, data: any, context: functions.https.CallableContext) => {
  const uid = utils.validate_auth(context);
  const isLine = uid.slice(0, 5) === "line:"
  const uidLine = isLine ? uid.slice(5) : context.auth?.token?.line?.slice(5)
  try {
    //return sendMessageInternal(uidLine, "test message");
    const LINE_MESSAGE_TOKEN = functions.config().line.message_token;
    const profile = await netutils.request(`https://api.line.me/v2/bot/profile/${uidLine}`, {
      headers: {
        Authorization: `Bearer ${LINE_MESSAGE_TOKEN}`
      }
    })
    if (profile.userId && profile.displayName) {
      return { result: true, profile }
    } else {
      return { result: false }
    }
  } catch (error) {
    throw utils.process_error(error)
  }
}

export const authenticate = async (db: FirebaseFirestore.Firestore, data: any, context: functions.https.CallableContext) => {
  const { code, redirect_uri, client_id } = data;
  utils.validate_params({ code, redirect_uri, client_id })
  const LINE_TRACK_KEY = functions.config().line.track

  try {
    // We validate the OAuth token (code) given to the redirected page.
    // Result: access_token, id_token, expires_in, refresh_token, scope, token_type
    const access = await netutils.postForm("https://api.line.me/oauth2/v2.1/token", {
      grant_type: "authorization_code",
      code,
      redirect_uri,
      client_id,
      client_secret: LINE_TRACK_KEY
    })
    if (!access.id_token || !access.access_token) {
      throw new functions.https.HttpsError('invalid-argument',
        'Validation failed.', { params: access }
      )
    }

    // We verify this code.
    // amr, aud, exp, iat, iss, name, sub
    const verified = await netutils.postForm('https://api.line.me/oauth2/v2.1/verify', {
      id_token: access.id_token,
      client_id
    })
    if (!verified.sub) {
      throw new functions.https.HttpsError('invalid-argument',
        'Verification failed.', { params: verified }
      )
    }

    // We get user's profile
    const profile = await netutils.request('https://api.line.me/v2/profile', {
      headers: {
        Authorization: `Bearer ${access.access_token}`
      }
    })

    const uidLine = "line:" + profile.userId;
    await db.doc(`/line/${uidLine}/system/line`).set({
      access, verified, profile
    }, { merge: true })
    const customToken = await admin.auth().createCustomToken(uidLine)
    return { profile, customToken, nonce: verified.nonce };
  } catch (error) {
    throw utils.process_error(error)
  }
}

export const validate = async (db: FirebaseFirestore.Firestore, data: any, context: functions.https.CallableContext) => {
  const uid = utils.validate_auth(context);

  const { code, redirect_uri, client_id } = data;
  utils.validate_params({ code, redirect_uri, client_id })

  const LINE_SECRET_KEY = functions.config().line.secret;

  try {
    // We validate the OAuth token (code) given to the redirected page.
    // Result: access_token, id_token, expires_in, refresh_token, scope, token_type
    const access = await netutils.postForm("https://api.line.me/oauth2/v2.1/token", {
      grant_type: "authorization_code",
      code,
      redirect_uri,
      client_id,
      client_secret: LINE_SECRET_KEY
    })
    if (!access.id_token || !access.access_token) {
      throw new functions.https.HttpsError('invalid-argument',
        'Validation failed.', { params: access }
      )
    }

    // We verify this code.
    // amr, aud, exp, iat, iss, name, sub
    const verified = await netutils.postForm('https://api.line.me/oauth2/v2.1/verify', {
      id_token: access.id_token,
      client_id
    })
    if (!verified.sub) {
      throw new functions.https.HttpsError('invalid-argument',
        'Verification failed.', { params: verified })
    }

    // We get user's profile
    const profile = await netutils.request('https://api.line.me/v2/profile', {
      headers: {
        Authorization: `Bearer ${access.access_token}`
      }
    })

    const lineUid = `line:${profile.userId}`
    if (context.auth!.token.phone_number) {
      // For end-user, seet the custom claim
      await admin.auth().setCustomUserClaims(uid, {
        line: lineUid
      })

      await db.doc(`/users/${uid}/system/line`).set({
        access, verified, profile
      }, { merge: true })
    } else {
      // Remove unnecessary claims from previous version.
      await admin.auth().setCustomUserClaims(uid, { line: null })
    }

    return { profile, nonce: verified.nonce };
  } catch (error) {
    throw utils.process_error(error)
  }
}

export const sendMessageDirect = async (lineId: string, message: string) => {
  const LINE_MESSAGE_TOKEN = functions.config().line.message_token;
  return netutils.postJson('https://api.line.me/v2/bot/message/push', {
    headers: {
      //Authorization: `Bearer ${data.access.access_token}`
      Authorization: `Bearer ${LINE_MESSAGE_TOKEN}`
    }
  }, {
    to: lineId,
    messages: [
      { type: "text", text: message }
    ]
  })
}

export const sendMessage = async (db: FirebaseFirestore.Firestore, uid: string | null, message: string) => {
  if (uid === null) {
    return;
  }
  const data = (await db.doc(`/users/${uid}/system/line`).get()).data() || (await db.doc(`/admins/${uid}/system/line`).get()).data();
  const sub = data && data.profile && data.profile.userId
  if (!sub) {
    return;
  }
  return sendMessageDirect(sub, message);
}
