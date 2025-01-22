import * as admin from "firebase-admin";
import * as functions from "firebase-functions/v1";
import * as utils from "../../lib/utils";
import * as netutils from "../../lib/netutils";
import * as crypto from "crypto";

import { liffAuthenticateData } from "../../lib/types";
import { validateLiffAuthenticate } from "../../lib/validator";

const LIFF_SALT = process.env.LIFF_SALT;

const getLiffConfig = async (db: admin.firestore.Firestore, liffIndexId: string) => {
  const liffConfig = (await db.doc(`/liff/${liffIndexId}`).get()).data();
  if (!liffConfig) {
    throw new functions.https.HttpsError("invalid-argument", "Verification failed.");
  }
  return liffConfig;
};

// eslint-disable-next-line
export const liffAuthenticate = async (db: admin.firestore.Firestore, data: liffAuthenticateData, context: functions.https.CallableContext) => {
  const { liffIndexId, token } = data;
  utils.required_params({ liffIndexId, token });

  const validateResult = validateLiffAuthenticate(data);
  if (!validateResult.result) {
    console.error("validate", validateResult.errors);
    throw new functions.https.HttpsError("invalid-argument", "Validation Error.");
  }

  try {
    const liffConfig = await getLiffConfig(db, liffIndexId);

    // We verify this code.
    const verified = await netutils.postForm("https://api.line.me/oauth2/v2.1/verify", {
      id_token: token,
      client_id: liffConfig.clientId,
    });
    if (!verified.sub) {
      throw new functions.https.HttpsError("invalid-argument", "Verification failed.");
    }

    const lineUid = verified.sub;
    const uidBase = [LIFF_SALT, liffConfig.clientId, lineUid].join(":");
    const userId = "liff:" + crypto.createHash("sha256").update(uidBase).digest("hex");

    try {
      await admin.auth().getUser(userId);
    } catch (__e) {
      // no user
      await admin.auth().createUser({ uid: userId });
      await admin.auth().setCustomUserClaims(userId, {
        line: lineUid,
        liffId: liffConfig.liffId,
      });
      await db.doc(`/users/${userId}/system/line`).set(
        {
          verified,
          liffIndexId,
          liffId: liffConfig.liffId,
          lineChannelId: liffConfig.clientId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    }
    const customToken = await admin.auth().createCustomToken(userId);

    return { nonce: verified.nonce, customToken };
  } catch (error) {
    throw utils.process_error(error);
  }
};
