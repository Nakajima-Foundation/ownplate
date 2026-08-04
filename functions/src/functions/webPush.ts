import * as admin from "firebase-admin";
import { CallableRequest, HttpsError } from "firebase-functions/v2/https";

import { RegisterWebPushData, UnregisterWebPushData } from "../models/functionTypes";
import { validateRegisterWebPush, validateUnregisterWebPush } from "../lib/validator";
import * as utils from "../lib/utils";
import { subscriptionCollectionPath, subscriptionIdOf } from "./notify/webpush";

export const registerWebPush = async (db: admin.firestore.Firestore, data: RegisterWebPushData, context: CallableRequest) => {
  const uid = utils.validate_admin_auth(context);

  const validateResult = validateRegisterWebPush(data);
  if (!validateResult.result) {
    console.error("registerWebPush", validateResult.errors);
    throw new HttpsError("invalid-argument", "Validation Error.");
  }

  const { endpoint, p256dh, auth } = data;
  await db.doc(`${subscriptionCollectionPath(uid)}/${subscriptionIdOf(endpoint)}`).set({
    endpoint,
    keys: { p256dh, auth },
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { result: true };
};

export const unregisterWebPush = async (db: admin.firestore.Firestore, data: UnregisterWebPushData, context: CallableRequest) => {
  const uid = utils.validate_admin_auth(context);

  const validateResult = validateUnregisterWebPush(data);
  if (!validateResult.result) {
    console.error("unregisterWebPush", validateResult.errors);
    throw new HttpsError("invalid-argument", "Validation Error.");
  }

  await db.doc(`${subscriptionCollectionPath(uid)}/${subscriptionIdOf(data.endpoint)}`).delete();
  return { result: true };
};
