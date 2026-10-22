// 通知を受けうる画面かどうか。店舗側（/admin）と、登録した端末の画面（/pushdevice）。
//
// **客側は含めない。** 客の端末には受け取る登録が無いうえ、ここを広げると FCM の
// SDK が入口の束に入り、全員に配ることになる（いまは専用の束に分かれている）。
const PUSH_SURFACES = ["/admin", "/pushdevice"];

// 前方一致そのままだと /administrator のような別経路まで拾うので、
// 区切りまで見る。
export const isPushSurface = (path: string): boolean =>
  PUSH_SURFACES.some(
    (surface) => path === surface || path.startsWith(`${surface}/`),
  );
