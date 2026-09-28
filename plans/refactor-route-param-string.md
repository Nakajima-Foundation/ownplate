# route.params を routeParamOf で文字列として読む

## なぜ

vue-router の `route.params` の型は `string | string[]`。画面は `as string` で言い切るか、`string | string[]` のまま先へ渡していた。配列になるのは繰り返し（`+` / `*`）の引数だけで、このアプリの経路（`src/lib/router.ts`）には無い。

## やること

- `src/utils/routeParam.ts` に `routeParamOf` を足す。
  - 値には触れず、文字列として型を当てるだけ（`collectionData` と同じ考え方）。
  - 言い切る所を、理由を書いたこの1か所に集める。
- `route.params.xxx as string` を `routeParamOf(route.params.xxx)` にする。
- `route.params` を変数に入れる・return して先へ渡している所も `routeParamOf` を通す。
  - これで型が `string` になる。
  - super の店舗の `restaurantId` もその1つで、`superTwilio` の callable に型を付けられた。
- 単体テスト `test_routeParam.ts`: 文字列・`undefined`・配列のどれも、値をそのまま返す。

## 実行時の動き

変えない。`routeParamOf` は引数をそのまま返す。その引数が無い経路で読むと、これまでどおり `undefined` が返る。

## やらないこと

- `route.query`: URL の書き方しだいで `null`（`?code` だけ）や配列（同じ名前を2回）が実際に来る。型を当てるだけだと嘘のままになる。直すには「文字列でなければ無視する」分岐が要り、動きが変わる。
  - 対象は `stripeConnect` の `code`、LINE の `code` / `state`、メールの `oobCode`、`to`、`lang`、`liff.state` など。
- `if` や `!!`、`===` で有無や等しさを見るだけの所。
- `LineCallback.vue` の `restaurantId as string | undefined`（引数が無い経路からも来る）。
