# 売上表の `accounting` を、大元の型で「必ずある」にする

## いまの形

`order2ReportData` は `accounting` が無ければその場で組み立て、地域にかかわらず
`accounting.service` を入れてから注文を返す。つまり **戻ってきた注文は
`accounting` も `accounting.service` も必ず持つ**。

しかし戻り値の型は引数の型のままで、`accounting` も中の `service` も省略可のまま。
`ReportPage.vue` はそれを `ref<OrderInfoData[]>` で受けるので、テンプレートが
`order.accounting.food.revenue` と素直に読んでいる箇所が全部「無いかもしれない」と
言われる。

## 変えたこと

`ReportRow` を export して、`accounting` と `accounting.service` を必須にした。
`ReportPage.vue` の `orders` をその型で受ける。

**読む側に `?.` を足すのではなく、大元の宣言から省略可を外す形にした。** `?.` は
無いときに黙って進むので、どこで消えたのか分からなくなる。

実装は3箇所だけ形が変わった。いずれも **プロパティへの代入では型に伝わらない** ため:

| 前 | 後 | なぜ |
|---|---|---|
| `if (!order.accounting) { order.accounting = ... }` | `const accounting = order.accounting \|\| {...}` | `order` 自身の型は代入では変わらない |
| `order.accounting.service = {...}` | `Object.assign(accounting, { service })` | `Object.assign` は `T & U` を返すので型に伝わる |
| 地域で `if/else` して2回書く | `serviceTax` を三項で決めて1回書く | `service` を1回で組み立てる必要があるため。元は両方の枝で `revenue` が重複していた |

フォールバックの判定は元の `if (!order.accounting)` と同じ **偽値** の判定にした。
`??` にすると `accounting` が偽値の非 null だったとき、次の代入が例外になる。

## 同じ振る舞いであることの確かめ方

**読んで判断していない。** 旧実装をそのまま写して、新と並べて走らせた。

`accounting`（未定義・null・偽値・空配列・空・凍結・prototype 経由・`service` が
既にある・getter だけ）、金額（0・負・小数・NaN・Infinity）、税率（0・負・-1・NaN）、
日時欄の有無、注文種別、地域、`multiple` を総当たり。突き合わせたのは
**戻り値・引数がどう書き換わったか・戻り値が引数と同一実体か・例外の種類と文面**。
差は出なかった。

harness は壊して効きを確かめてある。`||` を `??` にする／注文へ戻すのをやめる／
`accounting` を書き換えず写しにする／地域の判定を反転／割り算をずらす／料金をずらす／
`type` を入れない、の7通りすべてで赤くなる。壊していない写しは差ゼロを返す。

`orderType` は `isEC` と `isDelivery` しか読まないので、`accounting` を注文へ戻す
位置は観測されない。`Math.round` を地域で呼ばなくなったが副作用は無い。

## 確かめていないこと

売上表の画面を開いていない。`AllOrders.vue` も `order2ReportData` を呼ぶが、
そちらは `accounting` を読まないので受け取る型は変えていない。
