# 型だけで消せる as を消す

## やること

- 何もしていない `as` と `!`（外しても型が変わらないもの）を、typescript-eslint の `no-unnecessary-type-assertion` の `--fix` で消す。
- 型を付け直せば要らなくなる `as` を消す。
  - 解析の関数（`analytics.ts`）の引数を、実際に読む項目（`Partial<MenuData>`）にする。対象は `quantity` を読まない関数（一品の閲覧・選択・カート追加・削除、一覧表示、`sku_item_data` / `sku_item_data2`）。呼ぶ側の `props.item as AnalyticsMenuData` などが要らなくなる。
  - `stripeVerify` の callable に、functions の `super/stripeVerify.ts` が返す形を書き、super の管理者一覧の `as` をやめる。
  - `doc2data` に型を渡す（メニュー編集の店舗一覧）。
  - `reduce<T>` と変数の型注釈で、空配列やオブジェクトの `as` をやめる（メニューの PDF、LINE の認可 URL）。
  - 項目名の配列に `satisfies (keyof T)[]` や型注釈を付け、`name as keyof T` をやめる（メニュー編集、店舗情報の検証、EC のお客様情報）。
- PDF の `getBase64()` を返す関数（`orderPrintData` / `testDownload` / `printOrder`）の戻り値の型を `Promise<string>` にし、`@ts-expect-error` を消す。呼ぶ側はどれも `await` している。
- 外しても型が通った `route.params.xxx as string` は外した。型は `string | string[]` になり、実物に合う。

## 実行時の動き

変えない。`main` とこのブランチで `yarn build` し、`dist` を `diff -rq` で比べて同じ。

## やらないこと（消すには実行するコードを変える必要がある）

- `route.params.xxx as string` の多く: 型は `string | string[]` で、`string` として使う先がある。
- Firestore の `data() as Model`: 項目がそろった型へ入れるには `collectionData` などの呼び出しが要る。
- `ref<OrderInfoData>({} as OrderInfoData)`: 空の初期値。
- `null` や別の型を外す分岐が要るもの:
  - `promotion.value as PromotionData`
  - `place_id.value as string`
  - `liff.getIDToken()`
  - Firebase Auth の `ApplicationVerifier` / `ConfirmationResult` / `MultiFactorError`
- `Object.keys()` の結果を鍵として使う所（Google の API、Stripe の接続 URL）。
- `utils.ts` の `countObj`、店舗ページの `([] as (MenuData | TitleData)[])`。
- PDF の `as any`（注文とメニューの PDF。前の PR に書いた）。
- `menu.ts` の `getNewItemData` の `@ts-expect-error`: 保存する形（空の `images` / `exceptHour`）が `MenuData` に合わない。保存用の型を別に作る必要があり、functions にもコピーされるファイル。
