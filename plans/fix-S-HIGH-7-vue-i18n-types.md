# S-HIGH-7: vue-i18n.ts の `as any` を公開型で解消

Refs: `omochikaeri-docs/Docs/code_review_vue_2026-04-30.md` S-HIGH-7

## 問題

`src/lib/vue-i18n.ts:73-86` で `numberFormats` / `datetimeFormats` に `as any` 2 箇所と `eslint-disable @typescript-eslint/no-explicit-any` コメント。

原因: 内側の `numberFormats` / `datetimeFormats` 定数に型注釈がなく、`style: "currency"` 等が `string` に widen されて `createI18n` の引数型と不整合だった。

## 修正方針

vue-i18n が export している `IntlNumberFormat` / `IntlDateTimeFormat`（`@intlify/core-base` の `NumberFormat` / `DateTimeFormat` の re-export、`{ [key: string]: NumberFormatOptions | DateTimeFormatOptions }` 構造）で内側の定数を明示型注釈。

外側の `{ en: numberFormats, ja: numberFormats, ... }` は `createI18n` の `NumberFormats<Schema, Locales>` ジェネリックで自動推論されるので、`as any` 不要。

## 変更ファイル

- `src/lib/vue-i18n.ts` のみ

## 影響範囲

- 純型変更、ランタイム差なし
- vue-i18n 11.4 で動作確認
- `as any` × 2、`eslint-disable` × 2 が削除される
