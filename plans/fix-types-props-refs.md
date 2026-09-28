# 型の無い props と ref に型を付ける

## やること

- `type: Object` のままだった props に `PropType` を付ける。
  - カート（`Cart.vue`）: `prices` / `selectedOptions` / `totalPrice`
  - カートのボタン（`CartButton.vue`）: `orders` / `totalPrice`
  - 値引きの案内（`PromotionMessage3.vue`）: `totalPrice`
  - 営業時間の入力（`HoursInput.vue`）: `modelValue`
  - 注文確認の地図（`Map.vue`）: `deliveryInfo`
  - super の店舗カード（`Components/Restaurant.vue`）: `restaurant`
  - メニューの PDF ボタン（`DownloadButton.vue`）: `menuObj`
- 店舗ページの合計の型 `CartTotalPrice` を `cartType.ts` に足す（3つの部品で使う）。
- 型の無い `ref()` に型を付ける。初期値は変えない。
  - 購読を止める関数（`Unsubscribe`）の入れ物
  - 注文履歴の `notFound`
  - 利用者の注文履歴の `last`

## 実行時の動き

変えない。`main` とこのブランチで `yarn build` し、`dist` を `diff -rq` で比べて同じ。

## やらないこと（型を付けるとコードを書き換える必要が出た所）

- カートの `menuObj`: 子の部品が、項目が必ずある商品を受け取る。
- 商品カードの `menuPickupData`: テンプレートが `exceptHour` を「有無を確かめてから」読んでいて、型の上ではそれがつながらない。
- 管理画面の配達設定の `shopInfo`、注文確認の地図の `shopInfo`: 店の緯度経度が無いこともある型になる。
- 決済の状態（`StripeStatus.vue`）の `orderInfo`: `payment` が無いこともある型になる。
- 値引きの期間の日付（`Discount.vue`）: 保存するときの `Timestamp.fromDate` が日付の無い場合を受けない。
- お知らせの設定、LIFF の設定、プリンタの設定、メニュー編集のプレビュー: 形を決める型がまだ無い。
