import { Firestore } from "firebase-admin/firestore";
import { SendResponse, getMessaging } from "firebase-admin/messaging";

import { webPushVapidPublicKey } from "../../common/project";
import { INVALID_TARGET_CODES, MULTICAST_LIMIT, SendRecord, appendSend, chunk } from "./webpushFormat";

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

export type WebPushTarget = { fid: string };

// 端末は FID で識別し、それをそのまま doc id にしている。
// 一覧で OFF にした端末は送信対象から外す（LINE の notify と同じ扱い）。
export const loadTargets = async (db: Firestore, restaurantId: string): Promise<WebPushTarget[]> => {
  const snapshot = await registrationsCollection(db, restaurantId).get();
  return snapshot.docs.filter((doc) => doc.data().notify).map((doc) => ({ fid: doc.id, recentSends: doc.data().recentSends ?? [] }));
};

// 宛先が死んでいても doc は消さない。消すと一覧から黙って無くなり、店舗側は
// 「届かなくなった」ことに気づけないまま、通知が来ないだけの状態になる。
// 送信対象から外すのは notify を落とすことで足りる。
// 宛先が死んでいても doc は消さない。消すと一覧から黙って無くなり、店舗側は
// 「届かなくなった」ことに気づけないまま、通知が来ないだけの状態になる。
// 送信対象から外すのは notify を落とすことで足りる。
//
// 1件ずつトランザクションにするのは、recentSends が読んでから書くまでの間に
// 別の注文の送信が挟まると記録が消えるため。消えるのが失敗の記録だと、
// アラートが出ずにこの機能の目的が果たせない。
const recordResult = async (db: Firestore, restaurantId: string, fid: string, response: SendResponse | undefined, now_ms: number) => {
  const code = response?.success ? undefined : (response?.error?.code ?? "unknown");
  const dead = code !== undefined && INVALID_TARGET_CODES.includes(code);
  const record: SendRecord = { at: now_ms, ok: !!response?.success, ...(code ? { code } : {}), ...(dead ? { dead: true } : {}) };
  const ref = registrationsCollection(db, restaurantId).doc(fid);
  await db.runTransaction(async (transaction) => {
    const current = await transaction.get(ref);
    if (!current.exists) {
      // 送信中に削除された端末。配信そのものは済んでいるので、記録先が無いだけ。
      return;
    }
    transaction.update(ref, {
      recentSends: appendSend(current.data()?.recentSends, record),
      ...(dead ? { notify: false } : {}),
    });
  });
};

const recordResults = async (db: Firestore, restaurantId: string, targets: WebPushTarget[], responses: SendResponse[], now_ms: number) => {
  await Promise.all(
    targets.map(async (target, index) => {
      try {
        await recordResult(db, restaurantId, target.fid, responses[index], now_ms);
      } catch (e) {
        console.error("webPush: could not record the send result", { fid: target.fid, error: e });
      }
    }),
  );
};

const deliverBatch = async (db: Firestore, restaurantId: string, data: Record<string, string>, targets: WebPushTarget[]) => {
  const fids = targets.map((target) => target.fid);
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
  await recordResults(db, restaurantId, targets, response.responses, Date.now());
  return { sent: response.successCount, failed: response.failureCount, codes };
};

// 500 宛先を超える分もまとめて配信する
export const sendWebPush = async (db: Firestore, restaurantId: string, data: Record<string, string>): Promise<WebPushResult> => {
  const targets = await loadTargets(db, restaurantId);
  if (targets.length === 0) {
    return { sent: 0, failed: 0, targets: 0, codes: [] };
  }
  const batches = await Promise.all(chunk(targets, MULTICAST_LIMIT).map((batch) => deliverBatch(db, restaurantId, data, batch)));
  return {
    sent: batches.reduce((total, batch) => total + batch.sent, 0),
    failed: batches.reduce((total, batch) => total + batch.failed, 0),
    targets: targets.length,
    codes: batches.flatMap((batch) => batch.codes),
  };
};
