import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";

import * as utils from "../../lib/utils";
import * as netutils from "../../lib/netutils";
import * as admin from "firebase-admin";
import { ownPlateConfig } from "../../common/project";

import { lineValidateData, LineAccessTokenResponse, LineProfileResponse, LineVerifyResponse } from "../../lib/types";
import { validateLineValidate } from "../../lib/validator";

const line_message_token = defineSecret("LINE_MESSAGE_TOKEN");
const line_client_secret = defineSecret("LINE_SECRET_KEY");

const getUidLineAndToken = async (db: admin.firestore.Firestore, context: CallableRequest, customerUid: string, restaurantId?: string) => {
  if (restaurantId) {
    const config = await utils.get_restaurant_line_config(db, restaurantId);
    const lineUser = await utils.get_restaurant_line_user(db, restaurantId, customerUid);

    return {
      uidLine: lineUser?.profile?.userId,
      token: config?.message_token,
    };
  } else {
    const isLine = customerUid.slice(0, 5) === "line:"; // is Liff user
    const uidLine = isLine ? customerUid.slice(5) : context.auth?.token?.line?.slice(5);
    return {
      uidLine,
      token: line_message_token.value(),
    };
  }
};

export const verifyFriend = async (db: admin.firestore.Firestore, data: { restaurantId?: string }, context: CallableRequest) => {
  const customerUid = utils.validate_customer_auth(context);
  const { restaurantId } = data;
  const { uidLine, token } = await getUidLineAndToken(db, context, customerUid, restaurantId);
  if (!uidLine || !token) {
    return { result: false }; // restaurant line
  }
  try {
    const profile = await netutils.request<LineProfileResponse>(`https://api.line.me/v2/bot/profile/${uidLine}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (profile.userId && profile.displayName) {
      return { result: true, profile };
    } else {
      return { result: false };
    }
  } catch (error) {
    throw utils.process_error(error as Error);
  }
};

const getLineConfig = async (db: admin.firestore.Firestore, restaurantId?: string) => {
  if (restaurantId) {
    const restaurantData = await utils.get_restaurant(db, restaurantId);
    const { hasLine, lineClientId } = restaurantData;

    const restaurantLineData = await utils.get_restaurant_line_config(db, restaurantId);

    // get_restaurant
    const client_id = lineClientId;
    const client_secret = restaurantLineData.client_secret;

    if (!hasLine || !client_id || !client_secret) {
      throw new HttpsError("invalid-argument", "There is no restaurant with this id.");
    }

    return {
      client_id,
      client_secret,
    };
  } else {
    const client_id = ownPlateConfig.line.LOGIN_CHANNEL_ID;
    const client_secret = line_client_secret.value();
    return {
      client_id,
      client_secret,
    };
  }
};

export const validate = async (db: admin.firestore.Firestore, data: lineValidateData, context: CallableRequest) => {
  const uid = utils.validate_auth(context);

  const { code, redirect_uri, restaurantId } = data;
  utils.required_params({ code, redirect_uri });

  const validateResult = validateLineValidate(data);
  if (!validateResult.result) {
    console.error("validate", validateResult.errors);
    throw new HttpsError("invalid-argument", "Validation Error.");
  }

  const { client_id, client_secret } = await getLineConfig(db, restaurantId);

  try {
    // We validate the OAuth token (code) given to the redirected page.
    // Result: access_token, id_token, expires_in, refresh_token, scope, token_type
    const access = await netutils.postForm<LineAccessTokenResponse>("https://api.line.me/oauth2/v2.1/token", {
      grant_type: "authorization_code",
      code,
      redirect_uri,
      client_id,
      client_secret,
    });
    if (!access.id_token || !access.access_token) {
      throw new HttpsError("invalid-argument", "Validation failed.");
    }

    // We verify this code.
    // amr, aud, exp, iat, iss, name, sub
    const verified = await netutils.postForm<LineVerifyResponse>("https://api.line.me/oauth2/v2.1/verify", {
      id_token: access.id_token,
      client_id,
    });
    if (!verified.sub) {
      throw new HttpsError("invalid-argument", "Validation failed.");
    }

    // We get user's profile
    const profile = await netutils.request<LineProfileResponse>("https://api.line.me/v2/profile", {
      headers: {
        Authorization: `Bearer ${access.access_token}`,
      },
    });

    const lineUid = `line:${profile.userId}`;
    if (restaurantId) {
      await db.doc(`/restaurants/${restaurantId}/lineUsers/${uid}`).set(
        {
          access,
          verified,
          profile,
        },
        { merge: true },
      );
      await db.doc(`/restaurants/${restaurantId}/lineUsersData/${uid}`).set(
        {
          profile,
        },
        { merge: true },
      );
    } else if (context.auth!.token.phone_number) {
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
        { merge: true },
      );
    }
    // else {
    // Remove unnecessary claims from previous version.
    // await admin.auth().setCustomUserClaims(uid, { line: null });
    // }

    return { profile, nonce: verified.nonce };
  } catch (error) {
    throw utils.process_error(error as Error);
  }
};


export const getLiffPrivateConfig = async (db: admin.firestore.Firestore, liffIndexId: string) => {
  const liffPrivateConfig = (await db.doc(`/liff/${liffIndexId}/liffPrivate/data`).get()).data();
  if (!liffPrivateConfig) {
    console.log("getLineId: no liffPrivateConfig");
    return {};
  }
  const token = liffPrivateConfig.message_token;
  return {
    token,
  };
};
export const getLineId = async (db: admin.firestore.Firestore, uid: string | null) => {
  if (uid === null) {
    return {};
  }
  const data = (await db.doc(`/users/${uid}/system/line`).get()).data() || (await db.doc(`/admins/${uid}/system/line`).get()).data();
  // liff case
  if (data && data.liffIndexId) {
    const sub = data?.verified?.sub;
    return {
      lineId: sub,
      liffId: data.liffId,
      liffIndexId: data.liffIndexId,
    };
  } else {
    const sub = data && data.profile && data.profile.userId;
    if (!sub) {
      return {};
    }

    return {
      lineId: sub,
      liffId: null,
      liffIndexId: null,
    };
  }
};
