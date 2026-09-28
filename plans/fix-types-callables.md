# Functions の callable の型を、実際に送っている形に合わせる

## やること

- `functionTypes.ts`（functions へコピーされる）:
  - `OrderPlacedData`: `promotionId` を省略可・`null` 可にする（値引きを使わないとき画面は `null` を送る）。`affiliateId` を省略可にする。どちらも `validateOrderPlaced` が省略を許している。
  - `OrderChangeData` から `isSavePay` を外す。注文の変更（`stripe/orderChange.ts`）も `validateOrderChange` も読まない。
  - 決済用に `OrderPayData`（`restaurantId` / `orderId` / `isSavePay`）を足し、functions の `stripe/orderPay.ts` の引数の型にする。これまでは `OrderChangeData`（`newOrder` が必須）で受けていたが、画面は `newOrder` を送らない。
- 画面の `orderChange` / `orderPlace` / `orderPay` の callable に型を付ける。

## 実行時の動き

変えない（型だけ）。

- 画面: `main` とこのブランチで `yarn build` し、`dist` を `diff -rq` で比べて同じ。
- functions: `yarn build` と `unit_tests` が通る。

## やらないこと

- `superTwilio` / `stripeConnect`: 渡す値が `route.params` / `route.query`（`string | string[]`）。`route.params` の扱いを直すときに一緒にやる。
