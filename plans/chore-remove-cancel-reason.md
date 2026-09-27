# chore: 使われていない cancelReason を消す

Nakajima-Foundation/ownplate#1986 のコメント。取消の呼び出しは三箇所とも `cancelReason` を渡していないので、保存される値は店舗側の取消で `null`、利用者側で `"canceledByCustomer"` だけ。誰が取り消したかは `uidCanceledBy` が持っている。取消理由の入力欄は作らない。

## やること

- `functions/src/functions/stripe/cancelIntent.ts`: `cancelReason` を読まない・書かない
- `functions/src/lib/validator.ts`: `cancelReason` の検証を消す（`validateData` は規則にある項目しか見ないので、送られてきても弾かれない）
- `src/models/functionTypes.ts` の `OrderCancelData.cancelReason`、`src/models/orderInfoData.ts` の `cancelReason` を消す
- `src/app/admin/AllOrders.vue`: CSV の行データの `cancelReason`（`revenueCSVHeader` に無いので出力されていなかった）を消す
- `src/lang/*`: `order.cancelReason` を消す

## 変わること

- 取消時に注文ドキュメントへ `cancelReason` を書かなくなる。既存の注文に入っている値はそのまま残る
