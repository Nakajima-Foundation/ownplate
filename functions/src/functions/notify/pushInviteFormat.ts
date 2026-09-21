import { createHash, randomBytes } from "crypto";

// 招待はトップレベルに置く。URL にはトークンしか載せないので、店舗を知らずに
// ハッシュだけで引けないと、collectionGroup のクエリが要る。
export const PUSH_INVITE_COLLECTION = "pushInvites";

export const PUSH_INVITE_TOKEN_BYTES = 32;
export const PUSH_INVITE_TTL_MS = 24 * 60 * 60 * 1000;

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{22,128}$/;

export type PushInviteData = {
  restaurantId: string;
  createdBy: string;
  expiresAt: number;
  usedAt?: number | null;
};

// 照合できない理由。呼び出し側がそのまま利用者向けの文言に割り当てられるよう、
// 「見つからない」と「期限切れ」を潰さずに返す。
export type PushInviteRejection = "not-found" | "used" | "expired";

export const createInviteToken = () => randomBytes(PUSH_INVITE_TOKEN_BYTES).toString("base64url");

// doc id はトークンそのものではなくこのハッシュ。DB が漏れても URL は作れない。
export const hashInviteToken = (token: string) => createHash("sha256").update(token).digest("hex");

export const isInviteToken = (value: unknown): value is string => typeof value === "string" && TOKEN_PATTERN.test(value);

export const inviteUrl = (hostName: string, token: string) => `https://${hostName}/pushdevice/${token}`;

// 使用済みを期限切れより先に見る。期限が切れた使用済み招待を「期限切れ」と言うと、
// 作り直せば通ると読めてしまう。
export const inviteRejection = (invite: PushInviteData | undefined, now_ms: number): PushInviteRejection | null => {
  if (!invite) {
    return "not-found";
  }
  if (invite.usedAt) {
    return "used";
  }
  if (now_ms >= invite.expiresAt) {
    return "expired";
  }
  return null;
};

export const inviteExpiry = (now_ms: number) => now_ms + PUSH_INVITE_TTL_MS;

// 端末の呼び名。一覧で見分けるためだけの値なので、空なら既定値に落として登録は通す。
// 長さを詰めるのは、一覧の行が崩れるのと、Firestore に無制限の文字列を置かないため。
export const MAX_DEVICE_NAME_LENGTH = 40;
export const DEFAULT_DEVICE_NAME = "名前のない端末";

export const deviceName = (raw: unknown, truncate: (text: string, max: number) => string) => {
  const trimmed = typeof raw === "string" ? raw.trim() : "";
  return trimmed ? truncate(trimmed, MAX_DEVICE_NAME_LENGTH) : DEFAULT_DEVICE_NAME;
};
