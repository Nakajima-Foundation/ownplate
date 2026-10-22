// FCM は 1 リクエストあたり 500 宛先まで受け付ける
export const MULTICAST_LIMIT = 500;

// 宛先そのものが死んでいることを示すコード。これらだけを prune の根拠にする。
// messaging/invalid-argument はペイロード不正でも返るので、生きている FID を
// 消してしまわないよう意図的に除外している。
export const INVALID_TARGET_CODES = ["messaging/installation-id-not-registered", "messaging/registration-token-not-registered", "messaging/invalid-registration-token"];

// 送信のたびに端末ごとに残す直近の結果。一覧がこれを読んで「届かなくなった端末」を出す。
// アラートの判定に必要なぶんより少し多く持つ。「今回だけ失敗したのか、続いているのか」が
// 一覧から読めるようにするため。
export const RECENT_SENDS_KEPT = 5;

// code は成功時に持たせない。Firestore は undefined を書けないので、呼ぶ側で省くこと。
//
// dead は「宛先そのものが死んでいる」と FCM が言った失敗。一覧の文言を分けるために要る。
// 失敗のすべてが再登録で直るわけではない（payload 不正や一時的な失敗もここを通る）ので、
// これが無いと「登録し直してください」を直しようのない失敗にも出すことになる。
export type SendRecord = { at: number; ok: boolean; code?: string; dead?: boolean };

export const appendSend = (previous: SendRecord[] | undefined, record: SendRecord): SendRecord[] =>
  [record, ...(Array.isArray(previous) ? previous : [])].slice(0, RECENT_SENDS_KEPT);

// 通知の payload は短く保つ。長い店舗名や商品名で banner が溢れるのを避ける。
const MAX_TITLE_LENGTH = 100;
const MAX_BODY_LENGTH = 300;

export type PushDevicePlatform = "ios" | "android" | "other";

export const adminOrderPath = (restaurantId: string, orderId: string) => {
  return `/admin/restaurants/${restaurantId}/orders/${orderId}`;
};

// 長さは符号位置で数える。slice は UTF-16 の単位で切るので、絵文字のような
// サロゲートペアの途中で切れて孤立サロゲートが残り、末尾が � になる。
export const truncate = (text: string, max: number) => {
  const characters = Array.from(text);
  if (characters.length <= max) {
    return text;
  }
  return characters.slice(0, max - 1).join("") + "…";
};

const PLATFORMS: readonly PushDevicePlatform[] = ["ios", "android", "other"];

export const asPlatform = (value: unknown): PushDevicePlatform => {
  const known = PLATFORMS.find((platform) => platform === value);
  return known ?? "other";
};

export const detectPlatform = (userAgent: string): PushDevicePlatform => {
  if (/iphone|ipad|ipod/iu.test(userAgent)) {
    return "ios";
  }
  if (/android/iu.test(userAgent)) {
    return "android";
  }
  return "other";
};

// data のみで送り、表示は Service Worker 側で組み立てる。notification ブロックを
// 付けると FCM SDK が独自に表示してしまい、通知が二重に出る。
export const createWebPushData = (title: string, body: string, url: string): Record<string, string> => {
  return {
    title: truncate(title, MAX_TITLE_LENGTH),
    body: truncate(body, MAX_BODY_LENGTH),
    url,
  };
};

export const createOrderPushData = (subject: string, restaurantName: string, restaurantId: string, orderId: string) => {
  return createWebPushData(subject, restaurantName, adminOrderPath(restaurantId, orderId));
};

export const chunk = <T>(items: T[], size: number): T[][] => {
  return Array.from({ length: Math.ceil(items.length / size) }, (_unused, index) => items.slice(index * size, index * size + size));
};
