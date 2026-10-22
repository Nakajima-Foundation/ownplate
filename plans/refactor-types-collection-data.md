# Firestore の読み込みの as を collectionData にする

## やること

- `x.data() as Model` と `{} as Model`（初期値）を `collectionData<Model>(...)` にする。
  - `collectionData` は引数をそのまま返す関数（`src/utils/utils.ts`）。型を当てる場所を一つに集めるためのもの。
  - 実行時に増えるのは、この呼び出しだけ。値・分岐・読み込む module は変わらない（どのファイルも前から `@/utils/utils` を読んでいる）。
- 対象:
  - 管理画面の全注文
  - メニュー一覧の店舗
  - 注文詳細とお客様の注文画面の注文（初期値と読み込み）
  - エリアの店舗一覧、お客様の注文履歴、在庫の確認
  - super の全注文
  - 値引きの履歴（`promotion.ts`）

## やらないこと

- `getDoc` で1件読む所（管理画面・super の全注文の店舗、注文カードの店舗、`getPromotion`）。`data()` は文書が無いと `undefined` を返す。`as` はそれを隠しているので、直すには無い場合の分岐を足す必要がある。
- Stripe のカード入力欄: `cardElem.value.on` を `cardElement.on` にすると、呼ぶときの `this` が Vue の reactive proxy から元のオブジェクトに変わる。同じ動きだと言い切れない。
- `RestaurantUtils.ts`: 単体テストから読むファイル。`collectionData` のために `utils.ts` を読むと Firebase の初期化まで引く。

## 確かめたこと

- `typecheck` / `typecheck:vue` / `typecheck:test` / `lint` / `test`
- e2e: `order` / `orderHistory` / `adminOrderScreens` / `discountRules` / `soldOut`
