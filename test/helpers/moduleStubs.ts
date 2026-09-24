// `.vue` の script を取り出して走らせるときに、外へ出ていく import の差し替え先。
//
// 子部品は setup から触られないので、名前だけある空の部品でよい。
// Firebase の初期化は走らせたくないので、db は印だけの値にする。

export const db = { __stubDb: true };
export const auth = { __stubAuth: true };
export const storage = { __stubStorage: true };
export const analytics = { __stubAnalytics: true };
export const functions = { __stubFunctions: true };

export default { name: "StubComponent", render: () => null };
