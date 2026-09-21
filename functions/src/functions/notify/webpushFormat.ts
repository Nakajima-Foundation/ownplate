// FCM は 1 リクエストあたり 500 宛先まで受け付ける
export const MULTICAST_LIMIT = 500;

// 宛先そのものが死んでいることを示すコード。これらだけを prune の根拠にする。
// messaging/invalid-argument はペイロード不正でも返るので、生きている FID を
// 消してしまわないよう意図的に除外している。
export const INVALID_TARGET_CODES = [
  "messaging/installation-id-not-registered",
  "messaging/registration-token-not-registered",
  "messaging/invalid-registration-token",
];

// 通知の payload は短く保つ。長い店舗名や商品名で banner が溢れるのを避ける。
const MAX_TITLE_LENGTH = 100;
const MAX_BODY_LENGTH = 300;

export type PushDevicePlatform = "ios" | "android" | "other";

export type WebPushChild = {
  uid: string;
  restaurantLists: string[];
};

export const adminOrderPath = (restaurantId: string, orderId: string) => {
  return `/admin/restaurants/${restaurantId}/orders/${orderId}`;
};

// 長さは符号位置で数える。slice は UTF-16 の単位で切るので、絵文字のような
// サロゲートペアの途中で切れて孤立サロゲートが残り、末尾が � になる。
const truncate = (text: string, max: number) => {
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
export const createWebPushData = (
  title: string,
  body: string,
  url: string,
): Record<string, string> => {
  return {
    title: truncate(title, MAX_TITLE_LENGTH),
    body: truncate(body, MAX_BODY_LENGTH),
    url,
  };
};

export const createOrderPushData = (
  subject: string,
  restaurantName: string,
  restaurantId: string,
  orderId: string,
) => {
  return createWebPushData(
    subject,
    restaurantName,
    adminOrderPath(restaurantId, orderId),
  );
};

export const notifyTargetUids = (
  ownerUid: string,
  children: WebPushChild[],
  restaurantId: string,
) => {
  const childUids = children
    .filter((child) => child.restaurantLists.includes(restaurantId))
    .map((child) => child.uid);
  return [ownerUid, ...childUids];
};

export const chunk = <T>(items: T[], size: number): T[][] => {
  return Array.from(
    { length: Math.ceil(items.length / size) },
    (_unused, index) => items.slice(index * size, index * size + size),
  );
};
