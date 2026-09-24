# 注文の型に、実際に書かれている欄を足す

## 何が起きていたか

`OrderInfoData` に宣言が無い欄を、画面が読んでいた。`vue-tsc` の誤り40件ぶん。

| 欄                              | 書いているのは                                                                   |
| ------------------------------- | -------------------------------------------------------------------------------- |
| `promotionId` / `promotionName` | `functions/src/functions/order/orderPlace.ts:286-287`（注文確定時）              |
| `isLiff`                        | `src/app/user/RestaurantPage.vue:659`（注文を作るとき）                          |
| `restaurant`                    | `src/app/admin/AllOrders.vue:266` ほか（一覧が後から付ける。Firestore には無い） |

**書き手を確かめてから足した。** 読み手しかいない欄は足していない（下記）。

## 測ったこと

|                      | 前  | 後   |
| -------------------- | --- | ---- |
| `vue-tsc` 全体       | 486 | 446  |
| 誤りが増えたファイル | —   | なし |

型の宣言だけなので、出力される JavaScript は変わらない。

`src/models/orderInfoData.ts` は `scripts/copy2functions.sh` が `functions/` へ配る正本なので、
functions 側の `yarn build` と `yarn ci_test` も通ることを確認した。

## 足さなかったもの

読み手はあるが**書き手が見つからなかった**もの。型に足すと「ある」と宣言することになるので
足さない。

- `OrderInfoData.client_secret` / `.hasPayment` — `Pay.vue:69,72` が読む。`orderPlace` の
  返り値には同名の欄があるが、それが注文に載る経路を追えなかった
- `MenuData.subCategory` / `.productId` / `.category` — `ReportDetails.vue:294-296` と
  `super/DownloadCSV.vue` が `|| ""` つきで読む。**この repo に書き手が無い**

SingularitySociety/omochikaeri-docs に記録する。
