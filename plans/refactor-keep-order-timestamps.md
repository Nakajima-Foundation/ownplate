# refactor: 注文の日時を Timestamp のまま読む（toDate() の上書きをやめる）

Nakajima-Foundation/ownplate#1981。方針（2026-09-28 決定）: 別の属性を作らず、読む所で変換する。

## やること

- 注文の `timePlaced` / `timeEstimated` / `timeConfirmed` を `toDate()` で上書きするのをやめる
  - お客さんの注文履歴、管理画面の注文履歴・注文一覧・利用者の履歴、スーパー管理画面の注文一覧、レポートの `order2ReportData`
- 変換後の値を読んでいた所を、読む所で変換する
  - 並べ替え（管理画面の注文履歴・利用者の履歴）: `toDate()` で Date にしてから比べる（以前と同じ比べ方）。`toMillis()` はナノ秒を小数のミリ秒で残すので、同じミリ秒でナノ秒だけ違う 2 件の順が変わる。使わない
  - CSV（管理画面の注文履歴の `DownloadOrders`、スーパー管理画面の注文一覧）: `formatDay(asDate(...))`
  - 共通の部品 `OrderedInfo.vue` とレポートの画面はすでに `asDate` で両方を受ける
- お客さんの注文履歴で `timePlaced` が無い注文は、以前と同じく今の時刻（`Timestamp.now()`）として出す
- `OrderInfoData` の getter / setter（読む `Timestamp` / 書く `Timestamp | Date`）を消し、`Timestamp` だけにする

## 変わること

- CSV の日時が moment の端末の時刻から `formatDay`（JST）になる。日本の端末では同じ
- `order2ReportData` は日時を書き換えなくなり、同じ注文に二度通しても落ちない

## 残り（この PR ではやらない）

- `OrderInfoPage` の `Number(orderPlacedAt) - Number(lastUpdatedAt)`（`Timestamp` を秒の文字列にして引く）。今の計算は正しいが `Timestamp.valueOf()` の形に頼っている
- 店舗設定の臨時休業日（`Wrapper.vue` が Date に直し、`ConvertedRestaurantInfoData` として型を分けてある）
