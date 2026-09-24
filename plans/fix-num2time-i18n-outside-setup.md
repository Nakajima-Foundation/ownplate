# fix: num2time が setup の外で呼ばれると落ちる

## 症状

店舗ページ (`/r/:restaurantId`) を開いたまま1分待つと、Sentry に `SyntaxError: 26` が出る。
以後も1分ごとに出続ける。端末・ブラウザ・店舗を問わない。

`26` は vue-i18n の `I18nErrorCodes.MUST_BE_CALL_SETUP_TOP`（`useI18n` を setup の外で呼んだ）。

## 原因

- `num2time`（`src/utils/utils.ts`）は呼ばれるたびに `useI18n()` を呼ぶ（f016e6718 で `i18n.global` から変更）。
- `src/components/App.vue` が1分ごとに `generalStore.updateDate()` を呼ぶ。
- `usePickupTime`（`src/utils/pickup.ts`）の `todaysLast` などの computed が古くなり、
  Vue の scheduler が描画前に setup の外で再計算する。
- その中の `num2time` → `useI18n()` が、コンポーネントがないので例外を投げる。

## 修正

`num2time` を `i18n.global`（`src/lib/vue-i18n.ts`）で翻訳する形に戻す。
`legacy: false` なので `locale` は実行時には ref だが、型は文字列と宣言されているため、
`isRef` で両方を扱う。

同じファイルの `displayOption` / `useIsLocaleJapan` も `useI18n()` を呼ぶが、
呼び出し元はテンプレートか setup だけで、今は落ちないので対象外。

## 試験

`test/unit/test_pickupTime.ts` に、setup の中で `usePickupTime` を組み立てたあと、
setup の外で store の時計を進めて computed を読む試験を追加。
修正前は `code: 26` で落ち、修正後は通ることを確認済み。
