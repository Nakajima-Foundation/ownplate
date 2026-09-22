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
// dead は「宛先そのものが死んでいる」と FCM が言った失敗だけに立つ。
export type SendRecord = {
  at: number;
  ok: boolean;
  code?: string;
  dead?: boolean;
};

// アラートを出すかを決める窓。サーバが保持する件数より小さいこと。
// 大きくしても、保持していないぶんは見えないだけで害は無い。
export const FAILURE_ALERT_WINDOW = 3;

// 直近の送信に失敗が混じっている端末。ここに出るのは「FCM が宛先を拒否した」場合だけで、
// 端末側で通知を切っている・集中モードに入っているものは成功として返るため出ない。
const recentWindow = (recentSends: SendRecord[] | undefined): SendRecord[] =>
  (recentSends ?? []).slice(0, FAILURE_ALERT_WINDOW);

export const hasRecentFailure = (
  recentSends: SendRecord[] | undefined,
): boolean => recentWindow(recentSends).some((record) => !record.ok);

// 失敗のうち「宛先そのものが死んでいる」もの。これだけが再登録で直る。
// payload 不正や一時的な失敗にも再登録を指示すると、直らない作業をさせることになる。
export const needsReregistration = (
  recentSends: SendRecord[] | undefined,
): boolean => recentWindow(recentSends).some((record) => record.dead === true);

// 直近の失敗の FCM コード。再登録では直らない失敗の切り分けに要る。
export const recentFailureCode = (
  recentSends: SendRecord[] | undefined,
): string => recentWindow(recentSends).find((record) => !record.ok)?.code ?? "";

export const lastSend = (
  recentSends: SendRecord[] | undefined,
): SendRecord | null => recentSends?.[0] ?? null;
