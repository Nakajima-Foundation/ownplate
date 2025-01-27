import * as functions from "firebase-functions/v1";
import * as utils from "../../lib/utils";
import * as netutils from "../../lib/netutils";
import * as admin from "firebase-admin";
import { ownPlateConfig } from "../../common/project";

import { lineValidateData } from "../../lib/types";
import { validateLineValidate } from "../../lib/validator";

const getLineConfig = async (db: admin.firestore.Firestore, restaurantId?: string) => {
  if (restaurantId) {
    const restaurantData = await utils.get_restaurant(db, restaurantId);
    const { hasLine, lineClientId } = restaurantData;

    const restaurantLineData = await utils.get_restaurant_line_config(db, restaurantId);

    // get_restaurant
    const client_id = lineClientId;
    const client_secret = restaurantLineData.client_secret;

    if (!hasLine || !client_id || !client_secret) {
      throw new functions.https.HttpsError("invalid-argument", "There is no restaurant with this id.");
    }

    return {
      client_id,
      client_secret,
    };
  } else {
    const client_id = ownPlateConfig.line.LOGIN_CHANNEL_ID;
    const client_secret = process.env.LINE_SECRET_KEY;
    return {
      client_id,
      client_secret,
    };
  }
};

export const validate = async (db: admin.firestore.Firestore, data: lineValidateData, context: functions.https.CallableContext) => {
  const uid = utils.validate_auth(context);

  const { code, redirect_uri, restaurantId } = data;
  utils.required_params({ code, redirect_uri });

  const validateResult = validateLineValidate(data);
  if (!validateResult.result) {
    console.error("validate", validateResult.errors);
    throw new functions.https.HttpsError("invalid-argument", "Validation Error.");
  }

  const { client_id, client_secret } = await getLineConfig(db, restaurantId);

  try {
    // We validate the OAuth token (code) given to the redirected page.
    // Result: access_token, id_token, expires_in, refresh_token, scope, token_type
    const access = await netutils.postForm("https://api.line.me/oauth2/v2.1/token", {
      grant_type: "authorization_code",
      code,
      redirect_uri,
      client_id,
      client_secret,
    });
    if (!access.id_token || !access.access_token) {
      throw new functions.https.HttpsError("invalid-argument", "Validation failed.");
    }

    // We verify this code.
    // amr, aud, exp, iat, iss, name, sub
    const verified = await netutils.postForm("https://api.line.me/oauth2/v2.1/verify", {
      id_token: access.id_token,
      client_id,
    });
    if (!verified.sub) {
      throw new functions.https.HttpsError("invalid-argument", "Verification failed.");
    }

    // We get user's profile
    const profile = await netutils.request("https://api.line.me/v2/profile", {
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
    throw utils.process_error(error);
  }
};

