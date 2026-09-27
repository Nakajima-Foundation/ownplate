# feat: 画面の日時表示を JST で出す

SingularitySociety/omochikaeri-docs#229 の C。moment を将来外す前提（omochikaeri-docs#231）で、moment に頼らない形で揃える。

## やること

- `src/lib/vue-i18n.ts`: 日時の書式（`short` / `time` / `long`）に `timeZone: SHOP_TIME_ZONE`（Asia/Tokyo）を指定する。`$d` / `d` を使う表示が、お客さん向け（注文後の画面の注文日時と受取予定、注文履歴）も管理画面（注文詳細・注文一覧・未完了の注文・注文停止画面）もまとめて JST になる
- 注文画面（`TimeToPickup.vue`）と注文停止画面（`OrderSuspendPage.vue`）で個別に渡していた `timeZone` は、書式側で指定したので外す
- 管理画面のレポート（`ReportPage.vue`）の、書式名なしの `$d` に `timeZone` を渡す
- 店舗ページのキャンペーン期間（`FloatingBanner.vue`）を `moment(...).format` から `shopCalendar` の `formatDay` に替える
- `test/unit/test_datetimeFormats.ts`: どの端末のタイムゾーンでも JST で出る

## やらないこと

- 管理画面・CSV・PDF などに残る `moment(...).format`（#231 で少しずつ移す）
- `moment.tz.setDefault`（moment 全体に効く設定。外すときに影響を追いにくい）

## 変わること

- 日本の端末: 変わらない
- 日本以外のタイムゾーンの端末: 上の表示が JST の日付・時刻で出る
