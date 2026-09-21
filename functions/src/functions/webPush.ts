import { FieldValue, Firestore } from "firebase-admin/firestore";
import { CallableRequest, HttpsError } from "firebase-functions/v2/https";

import { CreatePushInviteData, RedeemPushInviteData, SendTestWebPushData } from "../models/functionTypes";
import { RestaurantInfoData } from "../models/RestaurantInfo";
import { validateCreatePushInvite, validateRedeemPushInvite } from "../lib/validator";
import * as utils from "../lib/utils";
import { ownPlateConfig } from "../common/project";
import { registrationsCollection, sendWebPush } from "./notify/webpush";
import { PUSH_INVITE_COLLECTION, PushInviteData, createInviteToken, deviceName, hashInviteToken, inviteExpiry, inviteRejection, inviteUrl } from "./notify/pushInviteFormat";
import { asPlatform, createWebPushData, truncate } from "./notify/webpushFormat";

const TEST_PUSH_PATH = "/admin/webpush";

const validated = (result: { result: boolean; errors: unknown[] }, name: string) => {
  if (!result.result) {
    console.error(name, result.errors);
    throw new HttpsError("invalid-argument", "Validation Error.");
  }
};

// 店舗を触れるのは、その店舗のオーナーか、その店舗を担当するサブアカウントだけ
const validateRestaurantAdmin = async (db: Firestore, context: CallableRequest, restaurantId: string) => {
  const ownerUid = utils.validate_owner_admin_auth(context);
  const uid = utils.validate_auth(context);
  if (utils.is_subAccount(context)) {
    await utils.validate_sub_account_request(db, uid, ownerUid, restaurantId);
  }
  const restaurant = (await utils.get_restaurant(db, restaurantId)) as RestaurantInfoData;
  if (restaurant.uid !== ownerUid) {
    throw new HttpsError("permission-denied", "The user does not have an authority to perform this operation.");
  }
  return uid;
};

// 通知を受ける端末は管理アカウントの持ち主とは限らない（厨房のタブレット、
// アルバイトのスマホ）。そこへログイン情報を渡さずに済むよう、登録はこの
// ワンタイム URL 経由だけにする。資格はトークンを知っていることだけ。
export const createPushInvite = async (db: Firestore, data: CreatePushInviteData, context: CallableRequest) => {
  validated(validateCreatePushInvite(data), "createPushInvite");
  const uid = await validateRestaurantAdmin(db, context, data.restaurantId);

  const token = createInviteToken();
  const now_ms = Date.now();
  const expiresAt = inviteExpiry(now_ms);
  // doc id はトークンではなくそのハッシュ。DB が漏れても URL は作れない。
  await db.collection(PUSH_INVITE_COLLECTION).doc(hashInviteToken(token)).set({
    restaurantId: data.restaurantId,
    createdBy: uid,
    createdAt: now_ms,
    expiresAt,
    usedAt: null,
  });
  return {
    result: true,
    url: inviteUrl(ownPlateConfig.hostName, token),
    expiresAt,
  };
};

// 認証不要。トークンを知っていることが唯一の資格で、書ける先はトークンが指す店舗だけ。
export const redeemPushInvite = async (db: Firestore, data: RedeemPushInviteData) => {
  validated(validateRedeemPushInvite(data), "redeemPushInvite");

  const inviteRef = db.collection(PUSH_INVITE_COLLECTION).doc(hashInviteToken(data.token));

  // 使用済みにするのと登録を書くのを1つのトランザクションに入れる。分けると、
  // 同じ URL を同時に開いた2台が両方とも「未使用」を読んで両方登録できてしまう。
  const restaurantId = await db.runTransaction(async (transaction) => {
    const invite = (await transaction.get(inviteRef)).data() as PushInviteData | undefined;
    const rejection = inviteRejection(invite, Date.now());
    if (rejection || !invite) {
      throw new HttpsError("permission-denied", rejection ?? "not-found");
    }
    transaction.update(inviteRef, { usedAt: Date.now() });
    transaction.set(
      registrationsCollection(db, invite.restaurantId).doc(data.fid),
      {
        fid: data.fid,
        name: deviceName(data.name, truncate),
        notify: true,
        platform: asPlatform(data.platform),
        invitedBy: invite.createdBy,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    return invite.restaurantId;
  });
  return { result: true, restaurantId };
};

// 動作確認用。宛先はその店舗の登録端末のみ。
export const sendTestWebPush = async (db: Firestore, data: SendTestWebPushData, context: CallableRequest) => {
  await validateRestaurantAdmin(db, context, data.restaurantId);
  const title = (data?.title ?? "").trim();
  if (!title) {
    throw new HttpsError("invalid-argument", "title is required.");
  }

  const payload = createWebPushData(title, (data?.body ?? "").trim(), TEST_PUSH_PATH);
  const result = await sendWebPush(db, data.restaurantId, payload);
  return { result: true, ...result };
};
