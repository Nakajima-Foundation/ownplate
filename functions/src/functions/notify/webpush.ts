import { Firestore } from "firebase-admin/firestore";
import { SendResponse, getMessaging } from "firebase-admin/messaging";

import { webPushVapidPublicKey } from "../../common/project";
import { INVALID_TARGET_CODES, MULTICAST_LIMIT, chunk } from "./webpushFormat";

export type WebPushResult = {
  sent: number;
  failed: number;
  targets: number;
  // 失敗の FCM エラーコード。これが無いと「送信できていない」としか分からず、
  // 宛先が死んでいるのか payload が悪いのかを切り分けられない。
  codes: string[];
};

// 登録は LINE と同じく店舗に紐づく。通知を受ける端末は管理アカウントの持ち主とは
// 限らない（厨房のタブレット、アルバイトのスマホ）ため、アカウント配下には置かない。
export const registrationsCollection = (db: Firestore, restaurantId: string) => {
  return db.collection("restaurants").doc(restaurantId).collection("pushRegistrations");
};

// 鍵が無い環境では登録自体が発生しないので、Firestore を読む前に打ち切る
export const isWebPushConfigured = () => {
  return webPushVapidPublicKey.length > 0;
};

// 端末は FID で識別し、それをそのまま doc id にしている。
// 一覧で OFF にした端末は送信対象から外す（LINE の notify と同じ扱い）。
export const loadFids = async (db: Firestore, restaurantId: string) => {
  const snapshot = await registrationsCollection(db, restaurantId).get();
  return snapshot.docs.filter((doc) => doc.data().notify).map((doc) => doc.id);
};

const pruneInvalidFids = async (db: Firestore, restaurantId: string, fids: string[], responses: SendResponse[]) => {
  const invalid = fids.filter((_fid, index) => {
    const code = responses[index]?.error?.code;
    return code !== undefined && INVALID_TARGET_CODES.includes(code);
  });
  await Promise.all(invalid.map((fid) => registrationsCollection(db, restaurantId).doc(fid).delete()));
};

const deliverBatch = async (db: Firestore, restaurantId: string, data: Record<string, string>, fids: string[]) => {
  const response = await getMessaging().sendEachForMulticast({ fids, data });
  const codes: string[] = [];
  response.responses.forEach((result, index) => {
    if (!result.success) {
      const code = result.error?.code ?? "unknown";
      codes.push(code);
      console.error("webPush: delivery failed", {
        fid: fids[index],
        code,
        message: result.error?.message,
      });
    }
  });
  await pruneInvalidFids(db, restaurantId, fids, response.responses);
  return { sent: response.successCount, failed: response.failureCount, codes };
};

// 500 宛先を超える分もまとめて配信する
export const sendWebPush = async (db: Firestore, restaurantId: string, data: Record<string, string>): Promise<WebPushResult> => {
  const fids = await loadFids(db, restaurantId);
  if (fids.length === 0) {
    return { sent: 0, failed: 0, targets: 0, codes: [] };
  }
  const batches = await Promise.all(chunk(fids, MULTICAST_LIMIT).map((batch) => deliverBatch(db, restaurantId, data, batch)));
  return {
    sent: batches.reduce((total, batch) => total + batch.sent, 0),
    failed: batches.reduce((total, batch) => total + batch.failed, 0),
    targets: fids.length,
    codes: batches.flatMap((batch) => batch.codes),
  };
};
