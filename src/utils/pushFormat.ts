// Firebase に依存しない push まわりの純ロジック。ブラウザも FCM プロジェクトも
// 無しで単体テストできるよう、ここには import type 以外を持ち込まない。

export type PushDevicePlatform = "ios" | "android" | "other";

export type PushDevice = {
  fid: string;
  platform: PushDevicePlatform;
  updatedAtMs: number | null;
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

// 端末が最後に使われた順。updatedAt はサーバ値が届くまで null になりうるので、
// その端末は末尾に寄せる。fid で同点を崩さないと並びが毎回揺れる。
export const sortDevices = (devices: PushDevice[]): PushDevice[] =>
  [...devices].sort((left, right) => {
    if (left.updatedAtMs !== right.updatedAtMs) {
      return (right.updatedAtMs ?? -1) - (left.updatedAtMs ?? -1);
    }
    return left.fid.localeCompare(right.fid);
  });

// push が実際に届くのは「サーバに登録済み」かつ「ブラウザが許可している」端末だけ。
// 許可だけ取り消された状態を「有効」と表示すると、直す手段のボタンが消えてしまう。
export const isPushEnabledHere = (
  devices: PushDevice[],
  currentFid: string,
  permission: string,
): boolean => {
  if (permission !== "granted" || currentFid === "") {
    return false;
  }
  return devices.some((device) => device.fid === currentFid);
};

// ブラウザ設定で拒否されている状態。requestPermission() は問い合わせずに denied を
// 返すため、押しても動かないボタンではなく設定を見るよう案内する必要がある。
export const isBlockedByBrowser = (permission: string): boolean =>
  permission === "denied";

export const describeSendResult = (sent: number, targets: number): string => {
  if (targets === 0) {
    return "no registered devices";
  }
  return `sent ${sent}/${targets}`;
};
