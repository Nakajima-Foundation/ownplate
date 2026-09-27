# feat: 受取日時を JST 基準で数える

SingularitySociety/omochikaeri-docs#229 の B。A（#2037）でまとめた `shopCalendar` を、端末のローカル時刻から JST に切り替える。

## やること

- `src/utils/shopCalendar.ts`: 0 時・曜日・0 時からの分・日付の書式を JST で数える。JST は UTC+9 固定で夏時間が無いので、時刻を 9 時間ずらして UTC として読む（moment-timezone を使わない。functions にもそのまま持っていける）。分と日の足し算は一定の長さで足す
- `SHOP_TIME_ZONE`（"Asia/Tokyo"）を出し、受取日時を使う画面の日付表示に渡す
  - 注文画面（`TimeToPickup.vue`）の受取日
  - 注文停止画面（`OrderSuspendPage.vue`）の日付と停止中の日時
- 「本日売り切れ」（`soldOutToday`）の今日も JST で決める（`src/utils/soldOut.ts`）。読む所（店舗ページの商品・カート・注文画面の在庫と明細）と、書く所（管理画面のメニュー一覧）。受取日の一覧と同じ暦でないと、海外の端末で JST の翌日に入った時間帯に食い違う
- 単体試験の日時を JST で組み立てる（`test/helpers/shopTime.ts`）。どのタイムゾーンで走らせても同じになる
- `test:tz`（America/Los_Angeles で単体試験）を足し、CI で走らせる
- e2e
  - `pickupRetry.spec.ts`: 送られた受取日時を JST で読む
  - `pickupScreens.spec.ts`: ブラウザをロサンゼルスにして、店舗情報が JST で出ることと、選んだ受取時刻が JST のその時刻として送られること

## 変わること

- 日本の端末: 変わらない
- 日本以外のタイムゾーンの端末: 受取日の一覧・時刻の選択肢・送る受取日時・店舗情報の日付と「Open」・注文停止画面が JST で数える。以前は端末の時刻で数えていたので、例えばロサンゼルスの端末で「今日 11:00」を選ぶと日本時間の翌日 3:00 として送っていた

## 対象外（C）

- 注文後の画面・履歴・管理画面の一覧などの時刻表示（端末のタイムゾーンのまま）
