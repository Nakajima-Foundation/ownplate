# 請求書 PDF の組み立てを単体テストできるようにする

omochikaeri-docs#183

## 何を直すか

`src/lib/pdf/pdf2.ts` は `pdfmake/build/pdfmake` を top-level import し、読み込み時に
`location.protocol` を評価する。したがって **`test/unit` から一切 import できない**。
`printOrderData` に置かれた判断はどれもテストで固定できず、`yarn lint` も `eslint src` なので
間違いは型でも lint でも捕まらない。

1日で3回実害が出た: PDF が消費税の行を一行も出していなかった件、割引のマイナス符号を消しても
緑だった件、日付ラベルを入れ替えても緑だった件。いずれも原因は同じ。

## どう直すか

レシート側（`buildReceiptText` + `receiptline.transform`）と同じ形にする。

- **`orderDocDefinition.ts`**（純粋）: `buildOrderDocDefinition` が pdfmake に渡す docDefinition を
  組み立てて返す。pdfmake も `location` も触らない
- **`pdfStyles.ts`**（純粋）: 体裁の定数
- **`pdf2.ts`**: pdfmake の読み込み・フォント・`location` だけを持ち、
  `pdfMake.createPdf(buildOrderDocDefinition(...))` に委譲する

純粋にするために必要だった前準備:

- `strings.ts` の `@/models/orderInfo` を**型専用の相対 import** に。`@/` は node が解決できず、
  `orderInfo.ts` は `@/utils/utils` 経由で firebase を引き込む。型の定義元
  （`orderInfoData`）を直接指す
- `roundPrice` を `utils.ts`（firebase と vue を読む）から **`price.ts`** へ切り出す
- `tsconfig.json` に `allowImportingTsExtensions` と `noEmit`。node の型剥がしは**値の import に
  `.ts` を要求する**のに、アプリ側の設定がそれを禁じていた。これが「純粋なファイルは値 import を
  持てない」の正体
- 電話番号は呼び出し側から渡す。整形が vue の composable なので、中で呼ぶと依存が戻る

## 確認

**旧実装と並走させる。** `pdfmake` と `@/utils/utils` を stub し、`location` を与えれば旧
`printOrderData` は node から読める。`createPdf` に渡る docDefinition を捕まえて比較する。

振る条件: 登録番号の有無と形・内外税（店舗/注文）・税率・税区分の有無・受渡方法・決済・
心づけ・送料・割引・受付済みかどうか・オプションの有無・税区分の無い商品。

## やること以外

- 文言は一切変えない。レシートと PDF で「カード決済 / 事前クレジット決済」「様 / さん」が
  食い違っているが、揃えると既存の書類の見た目が変わる。**テストで見えるようにするのがこの PR**
- `心づけ(税込)` / `配送料(税込)` のラベルは、計算されていない税を主張しているが触らない（#180）
