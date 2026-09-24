# 定数を索く鍵の型を、宣言で合わせる

## いまの形

定数の一覧を索いているのに、鍵の型が広がっていて索けない、という誤りが5件。
どちらも**定数の側**を直せば全部ふさがる。

| 定数 | 何が起きていたか | 索いている場所 |
| --- | --- | --- |
| `taxRates` | `["food", "alcohol"]` が `string[]` に広がり、その名前で索く `taxRateKeys` が索けない | `Restaurants/Index.vue`、`MenuItemPage.vue` |
| `daysOfWeek` | 鍵が数値のリテラル（1..7）なので、計算した番号で索けない | `Restaurants/Index.vue`、`Restaurant/Menu.vue`、`Restaurant/ShopInfo.vue` |

## 変えたこと

`src/config/constant.ts` の2つに型注釈を足しただけ。`as` は使っていない。

- `taxRates: ("food" | "alcohol")[]`
- `daysOfWeek: { [key: number]: string }`

## 出力が変わらないことの確かめ方

**読んで判断していない。** `src/config/constant.ts` を変更の前後で esbuild に通して
**出力を突き合わせた。完全に一致**（566行）。型注釈なので消える。

`constant.ts` は `functions/` へコピーされる正本。コピーを当てた状態で functions 側の
`build` と `ci_test` が通ることも確かめてある。

## 入れなかったもの（理由を測った見送り）

`Restaurants/Area.vue` の `regionalSetting.AddressStates[areaId]` も同じ族だが、
**直すと表示が変わる**ので入れていない。

`AddressStates` は配列、`areaId` は route の引数で文字列。番号に直すと
`"01"` や `" 1"` や `"1.0"` が当たるようになり、いまは何も出ない URL で都道府県名が
出るようになる。**URL に打てる値なので到達する。**

添字を文字列のまま通す形（複製してから索く）も試したが、`"length"` で差が出るうえ、
画面を開くたびに47件を複製することになる。1件の型の誤りに対して割に合わない。
