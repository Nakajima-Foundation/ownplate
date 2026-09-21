import * as admin from "firebase-admin";
import { CallableRequest, HttpsError } from "firebase-functions/v2/https";

import { RegisterWebPushData, SendTestWebPushData, UnregisterWebPushData } from "../models/functionTypes";
import { validateRegisterWebPush, validateUnregisterWebPush } from "../lib/validator";
import * as utils from "../lib/utils";
import { registrationsCollection, sendWebPush } from "./notify/webpush";
import { asPlatform, createWebPushData } from "./notify/webpushFormat";

const TEST_PUSH_PATH = "/admin/webpush";
const TEST_PUSH_TAG = "webpush-test";

const validated = (data: object, result: { result: boolean; errors: unknown[] }, name: string) => {
  if (!result.result) {
    console.error(name, result.errors);
    throw new HttpsError("invalid-argument", "Validation Error.");
  }
  return data;
};

// 端末が FCM に登録したあとに呼ぶ。uid は request.auth からしか取らないので、
// 他人のアカウントに端末を紐づけることはできない。
export const registerWebPush = async (db: admin.firestore.Firestore, data: RegisterWebPushData, context: CallableRequest) => {
  const uid = utils.validate_admin_auth(context);
  validated(data, validateRegisterWebPush(data), "registerWebPush");

  await registrationsCollection(db, uid).doc(data.fid).set(
    {
      fid: data.fid,
      platform: asPlatform(data.platform),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  return { result: true };
};

// サインアウト時や端末一覧からの削除で呼ぶ。削除できるのは自分の uid 配下だけ。
export const unregisterWebPush = async (db: admin.firestore.Firestore, data: UnregisterWebPushData, context: CallableRequest) => {
  const uid = utils.validate_admin_auth(context);
  validated(data, validateUnregisterWebPush(data), "unregisterWebPush");

  await registrationsCollection(db, uid).doc(data.fid).delete();
  return { result: true };
};

// 動作確認用。宛先は request.auth.uid の登録端末のみで、他のアカウントには届かない。
export const sendTestWebPush = async (db: admin.firestore.Firestore, data: SendTestWebPushData, context: CallableRequest) => {
  const uid = utils.validate_admin_auth(context);
  const title = (data?.title ?? "").trim();
  if (!title) {
    throw new HttpsError("invalid-argument", "title is required.");
  }

  const payload = createWebPushData(title, (data?.body ?? "").trim(), TEST_PUSH_PATH, TEST_PUSH_TAG);
  const result = await sendWebPush(db, [uid], payload);
  return { result: true, ...result };
};
