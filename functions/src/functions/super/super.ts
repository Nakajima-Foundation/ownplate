import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import * as utils from "../../lib/utils";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, Firestore } from "firebase-admin/firestore";

import { DispatchData } from "../../models/functionTypes";

export const dispatch = async (db: Firestore, data: DispatchData, context: CallableRequest) => {
  if (!context.auth?.token?.admin) {
    throw new HttpsError("permission-denied", "You do not have permission to confirm this request.");
  }
  const uidSuper = utils.validate_auth(context);
  const { cmd, uid, key, value } = data;
  utils.required_params({ cmd, uid });

  let result: object = { result: false, message: "not processed" };
  try {
    switch (cmd) {
    case "getCustomeClaims":
      result = await getCustomClaims(db, uid);
      break;
    case "setCustomClaim": {
      const userRecord = await getAuth().getUser(uid);
      if (key === "operator" && userRecord.email) {
        result = await setCustomClaim(db, uid, key, value);
        await db.collection(`admins/${uidSuper}/adminlogs`).add({
          uid,
          uidSuper,
          cmd,
          key,
          value,
          email: userRecord.email,
          success: true,
          createdAt: FieldValue.serverTimestamp(),
        });
      } else {
        await db.collection(`admins/${uidSuper}/adminlogs`).add({
          uid,
          uidSuper,
          cmd,
          key,
          value,
          success: false,
          error: "invalid_parameters",
          createdAt: FieldValue.serverTimestamp(),
        });
      }
      break;
    }
    default:
      await db.collection(`admins/${uidSuper}/adminlogs`).add({
        uid,
        uidSuper,
        cmd,
        key,
        value,
        success: false,
        error: "invalid_cmd",
        createdAt: FieldValue.serverTimestamp(),
      });
      throw new HttpsError("invalid-argument", "Invalid command.");
    }

    return result;
  } catch (error) {
    throw utils.process_error(error as Error);
  }
};

const getCustomClaims = async (db: Firestore, uid: string) => {
  const userRecord = await getAuth().getUser(uid);
  const customClaims = userRecord.customClaims || {};
  return { result: customClaims };
};

const setCustomClaim = async (db: Firestore, uid: string, key: string, value: boolean) => {
  const obj = { [key]: value };
  await getAuth().setCustomUserClaims(uid, obj);
  await db.doc(`admins/${uid}`).update(obj); // duplicated data in DB
  return await getCustomClaims(db, uid);
};

