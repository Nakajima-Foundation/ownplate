import * as functions from "firebase-functions";
import * as utils from "../lib/utils";
import * as netutils from "../lib/netutils";
import { ownPlateConfig } from "../common/project";
import * as admin from "firebase-admin";
import * as crypto from "crypto";

export const isEnabled = !!ownPlateConfig.line;

const LINE_MESSAGE_TOKEN = (functions.config() && functions.config().line && functions.config().line.message_token) || process.env.LINE_MESSAGE_TOKEN;
const LIFF_SALT = (functions.config() && functions.config().line && functions.config().line.liff_salt) || process.env.LIFF_SALT;

export const setCustomClaim = async (db: admin.firestore.Firestore, data: any, context: functions.https.CallableContext) => {
  const uid = utils.validate_auth(context);
  const isLine = uid.slice(0, 5) === "line:";
  try {
    if (isLine) {
      // This looks redundant, but it simplifies the firebase.rules
      await admin.auth().setCustomUserClaims(uid, {
        line: uid,
      });
    }
    return { success: isLine };
  } catch (error) {
    throw utils.process_error(error);
  }
};

export const verifyFriend = async (db: admin.firestore.Firestore, data: any, context: functions.https.CallableContext) => {
  const uid = utils.validate_auth(context);
  const isLine = uid.slice(0, 5) === "line:";
  const uidLine = isLine ? uid.slice(5) : context.auth?.token?.line?.slice(5);
  try {
    //return sendMessageInternal(uidLine, "test message");
    const profile = await netutils.request(`https://api.line.me/v2/bot/profile/${uidLine}`, {
      headers: {
        Authorization: `Bearer ${LINE_MESSAGE_TOKEN}`,
      },
    });
    if (profile.userId && profile.displayName) {
      return { result: true, profile };
    } else {
      return { result: false };
    }
  } catch (error) {
    throw utils.process_error(error);
  }
};

export const authenticate = async (db: admin.firestore.Firestore, data: any, context: functions.https.CallableContext) => { // eslint-disable-line
  const { code, redirect_uri, client_id } = data;
  utils.validate_params({ code, redirect_uri, client_id });
  const LINE_TRACK_KEY = functions.config().line.track;

  try {
    // We validate the OAuth token (code) given to the redirected page.
    // Result: access_token, id_token, expires_in, refresh_token, scope, token_type
    const access = await netutils.postForm("https://api.line.me/oauth2/v2.1/token", {
      grant_type: "authorization_code",
      code,
      redirect_uri,
      client_id,
      client_secret: LINE_TRACK_KEY,
    });
    if (!access.id_token || !access.access_token) {
      throw new functions.https.HttpsError("invalid-argument", "Validation failed.", { params: access });
    }

    // We verify this code.
    // amr, aud, exp, iat, iss, name, sub
    const verified = await netutils.postForm("https://api.line.me/oauth2/v2.1/verify", {
      id_token: access.id_token,
      client_id,
    });
    if (!verified.sub) {
      throw new functions.https.HttpsError("invalid-argument", "Verification failed.", { params: verified });
    }

    // We get user's profile
    const profile = await netutils.request("https://api.line.me/v2/profile", {
      headers: {
        Authorization: `Bearer ${access.access_token}`,
      },
    });

    const uidLine = "line:" + profile.userId;
    await db.doc(`/line/${uidLine}/system/line`).set(
      {
        access,
        verified,
        profile,
      },
      { merge: true }
    );
    const customToken = await admin.auth().createCustomToken(uidLine);
    return { profile, customToken, nonce: verified.nonce };
  } catch (error) {
    throw utils.process_error(error);
  }
};

export const validate = async (db: admin.firestore.Firestore, data: any, context: functions.https.CallableContext) => {
  const uid = utils.validate_auth(context);

  const { code, redirect_uri, client_id } = data;
  utils.validate_params({ code, redirect_uri, client_id });

  const LINE_SECRET_KEY = functions.config().line.secret;

  try {
    // We validate the OAuth token (code) given to the redirected page.
    // Result: access_token, id_token, expires_in, refresh_token, scope, token_type
    const access = await netutils.postForm("https://api.line.me/oauth2/v2.1/token", {
      grant_type: "authorization_code",
      code,
      redirect_uri,
      client_id,
      client_secret: LINE_SECRET_KEY,
    });
    if (!access.id_token || !access.access_token) {
      throw new functions.https.HttpsError("invalid-argument", "Validation failed.", { params: access });
    }

    // We verify this code.
    // amr, aud, exp, iat, iss, name, sub
    const verified = await netutils.postForm("https://api.line.me/oauth2/v2.1/verify", {
      id_token: access.id_token,
      client_id,
    });
    if (!verified.sub) {
      throw new functions.https.HttpsError("invalid-argument", "Verification failed.", { params: verified });
    }

    // We get user's profile
    const profile = await netutils.request("https://api.line.me/v2/profile", {
      headers: {
        Authorization: `Bearer ${access.access_token}`,
      },
    });

    const lineUid = `line:${profile.userId}`;
    if (context.auth!.token.phone_number) {
      // For end-user, seet the custom claim
      await admin.auth().setCustomUserClaims(uid, {
        line: lineUid,
      });

      await db.doc(`/users/${uid}/system/line`).set(
        {
          access,
          verified,
          profile,
        },
        { merge: true }
      );
    } else {
      // Remove unnecessary claims from previous version.
      await admin.auth().setCustomUserClaims(uid, { line: null });
    }

    return { profile, nonce: verified.nonce };
  } catch (error) {
    throw utils.process_error(error);
  }
};

export const sendMessageDirect = async (lineId: string, message: string, token: string) => {
  if (!token) {
    console.log("no line message token");
    return;
  }
  return netutils.postJson(
    "https://api.line.me/v2/bot/message/push",
    {
      headers: {
        //Authorization: `Bearer ${data.access.access_token}`
        Authorization: `Bearer ${token}`,
      },
    },
    {
      to: lineId,
      messages: [{ type: "text", text: message }],
    }
  );
};

/*
export const sendMessage = async (db: admin.firestore.Firestore, uid: string | null, message: string) => {
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
*/

export const getLineId = async (db: admin.firestore.Firestore, uid: string | null) => {
  if (uid === null) {
    return;
  }
  const data = (await db.doc(`/users/${uid}/system/line`).get()).data() || (await db.doc(`/admins/${uid}/system/line`).get()).data();
  // liff case
  if (data && data.liffIndexId) {
    const liffPrivateConfig = (await db.doc(`/liff/${data.liffIndexId}/liffPrivate/data`).get()).data();
    if (!liffPrivateConfig) {
      console.log("getLineId: no liffPrivateConfig");
      return {};
    }
    const token = liffPrivateConfig.message_token;
    const liffId = data.liffId;
    
    const sub = data?.verified?.sub;
    return {
      lineId: sub,
      liffId,
      token,
    }
  } else {
    const sub = data && data.profile && data.profile.userId;
    if (!sub) {
      return {};
    }
    
    return {
      lineId: sub,
    }
  }
};



export const liffAuthenticate = async (db: admin.firestore.Firestore, data: any, context: functions.https.CallableContext) => { // eslint-disable-line

  const { liffIndexId, token } = data;
  utils.validate_params({ liffIndexId, token });
  
  try {
    const liffConfig = (await db.doc(`/liff/${liffIndexId}`).get()).data();
    console.log(liffConfig);
    if (!liffConfig) {
      throw new functions.https.HttpsError("invalid-argument", "Verification failed.");
    }
    
    // We verify this code.
    const verified = await netutils.postForm("https://api.line.me/oauth2/v2.1/verify", {
      id_token: token,
      client_id: liffConfig.clientId,
    });
    // console.log(verified);
    if (!verified.sub) {
      throw new functions.https.HttpsError("invalid-argument", "Verification failed.", { params: verified });
    }

    const lineUid = verified.sub;
    const uidBase = [LIFF_SALT, liffConfig.clientId, lineUid].join(":");
    const userId = "liff:" + crypto.createHash("sha256").update(uidBase).digest("hex");

    try {
      await admin.auth().getUser(userId);
    } catch (e) {
      // no user
      await admin.auth().createUser({uid: userId})
      await admin.auth().setCustomUserClaims(userId, {
        line: lineUid,
        lineChannelId: liffConfig.clientId,
      });
    }
    const customToken = await admin.auth().createCustomToken(userId);

    await db.doc(`/users/${userId}/system/line`).set(
      {
        verified,
        liffIndexId,
        liffId: liffConfig.liffId,
        lineChannelId: liffConfig.clientId,
      },
      { merge: true }
    );
    
    return { nonce: verified.nonce, customToken };
  } catch (error) {
    throw utils.process_error(error);
  }
};
