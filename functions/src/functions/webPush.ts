import { FieldValue, Firestore } from "firebase-admin/firestore";
import { CallableRequest, HttpsError } from "firebase-functions/v2/https";

import { CheckPushInviteData, CreatePushInviteData, RedeemPushInviteData, SendTestWebPushData } from "../models/functionTypes";
import { RestaurantInfoData } from "../models/RestaurantInfo";
import { validateCheckPushInvite, validateCreatePushInvite, validateRedeemPushInvite } from "../lib/validator";
import * as utils from "../lib/utils";
import { ownPlateConfig } from "../common/project";
import { registrationsCollection, sendWebPush } from "./notify/webpush";
import { PUSH_INVITE_COLLECTION, PushInviteData, createInviteToken, deviceName, hashInviteToken, inviteExpiry, inviteStatus, inviteUrl } from "./notify/pushInviteFormat";
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

const inviteRef = (db: Firestore, token: string) => db.collection(PUSH_INVITE_COLLECTION).doc(hashInviteToken(token));

// 認証不要・状態を変えない。登録ページが「押す前に」使えるか確かめるためのもの。
//
// これが無いと、端末側の登録手順が先に installation id を回してしまう。回してから
// 招待が弾かれると、Firestore に残った古い FID は死に、端末は新しい FID を持った
// まま登録先が無くなる。招待は使い切りなので、その端末は自力で戻れない。
// PWA の start_url が招待 URL そのものなので、これはホーム画面から起動して
// ボタンを押すだけで起きる。
export const checkPushInvite = async (db: Firestore, data: CheckPushInviteData) => {
  validated(validateCheckPushInvite(data), "checkPushInvite");
  const invite = (await inviteRef(db, data.token).get()).data() as PushInviteData | undefined;
  return { result: true, status: inviteStatus(invite, Date.now(), data.fid) };
};

// 認証不要。トークンを知っていることが唯一の資格で、書ける先はトークンが指す店舗だけ。
export const redeemPushInvite = async (db: Firestore, data: RedeemPushInviteData) => {
  validated(validateRedeemPushInvite(data), "redeemPushInvite");

  const ref = inviteRef(db, data.token);

  // 使用済みにするのと登録を書くのを1つのトランザクションに入れる。分けると、
  // 同じ URL を同時に開いた2台が両方とも「未使用」を読んで両方登録できてしまう。
  const restaurantId = await db.runTransaction(async (transaction) => {
    const invite = (await transaction.get(ref)).data() as PushInviteData | undefined;
    const status = inviteStatus(invite, Date.now(), data.fid);
    if (status !== "usable" || !invite) {
      throw new HttpsError("permission-denied", status);
    }
    // どの端末が使ったかを残す。同じ端末が同じ URL を開き直したときに
    // 「使用済み」ではなく「この端末は登録済み」と出すために要る。
    transaction.update(ref, { usedAt: Date.now(), usedByFid: data.fid });
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
