# chore: functions の stripe を 22.6 に上げ、API バージョンを 2026-08-26.dahlia にする

## 変更

- `functions/package.json`: `stripe` を `~22.6.2`（21.0.1 から）
- `functions/src/lib/utils.ts`: `apiVersion` を `2026-03-25.dahlia` から `2026-08-26.dahlia`

`~` にするのは、stripe-node は小版で固定の API バージョン（と `apiVersion` の型）を上げるため。
`^` だと次の更新で型が合わなくなり、ビルドが止まる。

## なぜ API バージョンも上げるか

stripe-node 22 は CommonJS の型出力が 22.2.3 まで壊れており（`Stripe.Event` などが参照できない）、
型が直った版はどれも固定の API バージョンが 2026-05-27 以降になっている。functions は CommonJS で
ビルドするので、22 に上げるなら API バージョンも上げることになる。

## SDK 側の確認

- 22 で壊れる呼び出し（`paymentIntents.cancel` に options を2番目で渡していた）は #1978 で修正済み
- CJS の読み込み（`import Stripe from "stripe"` + `esModuleInterop`）は 22 でも動く
- 22.6.2 + `2026-08-26.dahlia` で functions の `yarn build`（型検査）/ `lint` / `unit_tests` が通る

## API 側の確認（Stripe の API 変更履歴）

2026-04-22 / 05-27 / 06-24 / 07-29 / 08-26 の GA 版（`.dahlia`）には破壊的変更がない。
一覧の破壊的変更はすべて `.preview` のもの。

使っている API と読んでいる項目:

- PaymentIntent: create / retrieve（`expand: latest_charge`）/ capture / cancel。`id`, `status`, `latest_charge.amount`
- Customer: create / retrieve（`sources`）/ del / deleteSource
- PaymentMethod: attach / detach、Token: create（顧客から店舗口座へ）
- Connect: OAuth token / deauthorize、accounts.retrieve（`capabilities.jcb_payments`）
- Webhook: `constructEvent`、`capability.updated` / `account.updated` / `account.application.authorized|deauthorized`

気にした項目:

- 2026-08-26「サポート外の統合パターンのブロック」: 新規プラットフォームが旧式 Express / Custom 口座でダイレクト支払いを使う場合のみ。既存プラットフォームには影響しないと明記
- `.preview` の `payment_method_types` 削除: preview のみ。コードでも使っていない

## 対象外 / 別作業

- Webhook エンドポイントの API バージョンはダッシュボードで決まり、この変更では変わらない（届くイベントの形は今のまま）
- 実際の Stripe（テストモード）での決済・キャンセル・Connect の確認は、デプロイ後に staging で行う
