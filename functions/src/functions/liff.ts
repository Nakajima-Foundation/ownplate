import * as functions from "firebase-functions";
import * as utils from "../lib/utils";
import * as netutils from "../lib/netutils";
import * as admin from "firebase-admin";
import * as crypto from "crypto";

const LIFF_SALT = (functions.config() && functions.config().line && functions.config().line.liff_salt) || process.env.LIFF_SALT;

const getLiffConfig = async (db: any, liffIndexId: string) => {
  const liffConfig = (await db.doc(`/liff/${liffIndexId}`).get()).data();
  if (!liffConfig) {
    throw new functions.https.HttpsError("invalid-argument", "Verification failed.");
  }
  return liffConfig;
};

export const liffAuthenticate = async (db: admin.firestore.Firestore, data: any, context: functions.https.CallableContext) => {
  // eslint-disable-line

  const { liffIndexId, token } = data;
  utils.validate_params({ liffIndexId, token });

  try {
    const liffConfig = await getLiffConfig(db, liffIndexId);

    // We verify this code.
    const verified = await netutils.postForm("https://api.line.me/oauth2/v2.1/verify", {
      id_token: token,
      client_id: liffConfig.clientId,
    });
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
          createdAt: admin.firestore.Timestamp.now(),
        },
        { merge: true }
      );
    }
    const customToken = await admin.auth().createCustomToken(userId);

    return { nonce: verified.nonce, customToken };
  } catch (error) {
    throw utils.process_error(error);
  }
};
