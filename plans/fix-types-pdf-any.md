# PDF 作成の any を pdfmake の型にする

## やること

- `pdfStyles.ts` の体裁の定数（`styles` / `defaultStyle` / `pageSize` / `pageMargins`）を `satisfies` で pdfmake の型に照らす。定数そのものの型は変えないので、テストが読む `pageSize.width` も今までどおり。
- `pdf2.ts` の試しの PDF 2つ（`orderDownloadData` / `testDownload`）を `TDocumentDefinitions` にして、`as any` と `eslint-disable` を消す。

## 実行時の動き

変えない。`main` とこのブランチで `yarn build` し、`dist` を `diff -rq` で比べて同じ。

## やらないこと（型を付けるとコードを変える必要がある）

- 注文の PDF（`orderDocDefinition.ts`）: 文字の行に `border` を渡している。pdfmake の型では、表のセル以外に `border` は無い。
- メニューの PDF（`pdf.ts`）: 表に `width` を渡している。上と同じく、型に無い項目。
- 試しの印刷（`orderPrintData` など）の `@ts-expect-error`: pdfmake 0.3 の `getBase64()` は Promise を返すが、`string` として受けている。
- Stripe のカード入力欄（`StripeCard.vue`）: 型パッケージ（`@stripe/stripe-js`）が無い。足すか、`cardElem.value.on` を `cardElement.on` に書き換える必要がある。
