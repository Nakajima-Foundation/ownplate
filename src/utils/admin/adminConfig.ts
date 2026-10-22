// 管理画面の切り替え設定の置き場と、保存されていないときの扱い。Firebase を読み込まないので
// 単体試験から呼べる。

// 管理者ごとの設定。**ここが管理者どうしの境目**で、uid を取り違えると別の管理者の設定を
// 読み書きする。
export const adminConfigPath = (uid: string) => `adminConfigs/${uid}`;

// 店舗ごとの設定。同じ管理者が複数の店舗を持つので、店舗まで含めて分ける。
export const adminRestaurantConfigPath = (uid: string, restaurantId: string) =>
  `${adminConfigPath(uid)}/restaurants/${restaurantId}`;

// 保存されていなければ既定値。**保存されているなら偽値でもそれを使う** — 倒すと、
// 切ったはずの設定が入ったままになる。
export const configValueOr = <T>(
  config: { [key: string]: T } | undefined,
  key: string,
  defaultValue: T,
): T => {
  const stored = (config || {})[key];
  return stored === undefined ? defaultValue : stored;
};
