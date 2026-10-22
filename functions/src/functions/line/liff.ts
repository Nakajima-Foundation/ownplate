import { getAuth } from "firebase-admin/auth";
import { FieldValue, Firestore } from "firebase-admin/firestore";
import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as utils from "../../lib/utils";
import * as netutils from "../../lib/netutils";
import * as crypto from "crypto";

import { LiffAuthenticateData } from "../../models/functionTypes";
import { LineVerifyResponse } from "../../lib/types/line";
import { validateLiffAuthenticate } from "../../lib/validator";

const LIFF_SALT = defineSecret("LIFF_SALT");

const getLiffConfig = async (db: Firestore, liffIndexId: string) => {
  const liffConfig = (await db.doc(`/liff/${liffIndexId}`).get()).data();
  if (!liffConfig) {
    throw new HttpsError("invalid-argument", "Verification failed.");
  }
  return liffConfig;
};

// eslint-disable-next-line
export const liffAuthenticate = async (db: Firestore, data: LiffAuthenticateData, context: CallableRequest) => {
  const { liffIndexId, token } = data;
  utils.required_params({ liffIndexId, token });

  const validateResult = validateLiffAuthenticate(data);
  if (!validateResult.result) {
    console.error("validate", validateResult.errors);
    throw new HttpsError("invalid-argument", "Validation Error.");
  }

  try {
    const liffConfig = await getLiffConfig(db, liffIndexId);

    // We verify this code.
    const verified = await netutils.postForm<LineVerifyResponse>("https://api.line.me/oauth2/v2.1/verify", {
      id_token: token,
      client_id: liffConfig.clientId,
    });
    if (!verified.sub) {
      throw new HttpsError("invalid-argument", "Verification failed.");
    }

    const lineUid = verified.sub;
    const uidBase = [LIFF_SALT.value(), liffConfig.clientId, lineUid].join(":");
    const userId = "liff:" + crypto.createHash("sha256").update(uidBase).digest("hex");

    try {
      await getAuth().getUser(userId);
    } catch (__e) {
      // no user
      await getAuth().createUser({ uid: userId });
      await getAuth().setCustomUserClaims(userId, {
        line: lineUid,
        liffId: liffConfig.liffId,
      });
      await db.doc(`/users/${userId}/system/line`).set(
        {
          verified,
          liffIndexId,
          liffId: liffConfig.liffId,
          lineChannelId: liffConfig.clientId,
          createdAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    }
    const customToken = await getAuth().createCustomToken(userId);

    return { nonce: verified.nonce, customToken };
  } catch (error) {
    throw utils.process_error(error as Error);
  }
};
