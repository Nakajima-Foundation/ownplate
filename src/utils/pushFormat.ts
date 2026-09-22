// Firebase に依存しない push まわりの純ロジック。ブラウザも FCM プロジェクトも
// 無しで単体テストできるよう、ここには import type 以外を持ち込まない。

export type PushDevicePlatform = "ios" | "android" | "other";

// 入力欄の上限。実際に詰めるのはサーバ側（functions の MAX_DEVICE_NAME_LENGTH）で、
// ここは打ちすぎを止めるだけ。
export const MAX_DEVICE_NAME_LENGTH = 40;

export const detectPlatform = (userAgent: string): PushDevicePlatform => {
  if (/iphone|ipad|ipod/iu.test(userAgent)) {
    return "ios";
  }
  if (/android/iu.test(userAgent)) {
    return "android";
  }
  return "other";
};

export const describeSendResult = (sent: number, targets: number): string => {
  if (targets === 0) {
    return "no registered devices";
  }
  return `sent ${sent}/${targets}`;
};

// Firestore の Timestamp だけを当てにする。serverTimestamp() は書き込み直後の
// ローカルスナップショットでは null になるので、そこも通る形にしておく。
export type TimestampLike = { seconds: number } | null | undefined;

// 一覧に出す登録日時。registeredAt は後から足したので、それ以前の登録には無い。
// updatedAt は引き換え時にしか書かれていないので、その場合はこれが登録日時になる。
export const registeredAtSeconds = (
  registeredAt: TimestampLike,
  updatedAt: TimestampLike,
): number | null => registeredAt?.seconds ?? updatedAt?.seconds ?? null;

// 送信のたびにサーバが端末ごとに残す結果。最新が先頭。
export type SendRecord = { at: number; ok: boolean; code?: string };

// アラートを出すかを決める窓。サーバが保持する件数より小さいこと。
// 大きくしても、保持していないぶんは見えないだけで害は無い。
export const FAILURE_ALERT_WINDOW = 3;

// 直近の送信に失敗が混じっている端末。ここに出るのは「FCM が宛先を拒否した」場合だけで、
// 端末側で通知を切っている・集中モードに入っているものは成功として返るため出ない。
export const hasRecentFailure = (
  recentSends: SendRecord[] | undefined,
): boolean =>
  (recentSends ?? [])
    .slice(0, FAILURE_ALERT_WINDOW)
    .some((record) => !record.ok);

export const lastSend = (
  recentSends: SendRecord[] | undefined,
): SendRecord | null => recentSends?.[0] ?? null;
