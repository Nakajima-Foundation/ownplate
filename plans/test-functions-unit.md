# functions: 純粋な関数のテストを node:test に集約し、CI で回す

omochikaeri-docs#191

## 方針

**テストだけの変更。** 実装は `export` を付ける程度に留める。

`functions/tests/unit/` を作り、**外部サービスも emulator も要らない純粋なテスト**をそこに集める。
CI の `yarn ci_test` はこのディレクトリを走らせる。

残りは現状のまま置く:

- `twilio_test.ts` / `sms_test.ts` / `ses_test.ts` — 本物の SMS とメールを送るのでローカル用
- `express_test.ts` / `stripe_test.ts` / `admin_smoke_test.ts` — Firestore emulator が要る
- `order_test.ts` / `order_change_test.ts` / `notify_test.ts` — 消えたモジュールを import しており、
  現在の API に対する書き直しが要る（この PR では触らない）

## やること

1. 既に `node:test` で書かれていて CI に載っている6本を `tests/unit/` へ移す
2. `functions/src` のテストの無い純粋な判断にテストを足す
3. `package.json` の script を、ディレクトリ単位で走らせる形に揃える

## テストを足す対象

| 対象 | 場所 |
| --- | --- |
| `orderAccounting` | `src/functions/order/orderCreated.ts` |
| `getUpdateOrder` | `src/functions/stripe/orderChange.ts`（`export` を付ける） |
| `getDiscountPrice` | `src/functions/order/promotion.ts` |
| `get_delivery_cost` | `src/lib/utils.ts` |
| `filterData` / `isEmpty` / `nameOfOrder` | `src/lib/utils.ts` |
| `parsePhoneNumber` ほか | `src/common/phoneutil.ts` |
| `getHash` | `src/functions/stripe/intent.ts` |

## 確かめ方

足したテストは、対象を壊して赤くなることを確認する。既存の6本は移動だけなので、
移動の前後で同じ数だけ通ることを確認する。
