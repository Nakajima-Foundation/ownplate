# refactor: 受取日時に関わる暦の計算を shopCalendar にまとめる

SingularitySociety/omochikaeri-docs#229 の A。JST 基準に切り替える（B）前に、暦の計算を 1 か所に集める。挙動は変えない（端末のローカル時刻のまま）。

## やること

- `src/utils/shopCalendar.ts`（新規）: `startOfDayAfter` / `weekdayOf` / `minutesOfDay` / `addMinutes` / `addDays` / `pickupDateOf` / `formatDay` / `dateKeyOf`。中身は置き換える前の式をそのまま写す
- `src/utils/pickupDate.ts` は `shopCalendar.ts` に移して消す
- ここを通すように変える所
  - `pickupDays.ts`: 日付の文字列、曜日、調理時間を足した一番早い時刻
  - `pickup.ts`（`usePickupTime`）: 「0 時」を `midNight` ではなく `startOfDayAfter(new Date(), offset)` で作る（`midNight` 自体は管理画面の一覧が使うので残す）
  - `holiday.ts`: 日付を `dateKeyOf` で文字列にしてから祝日を引く
  - 注文画面（`TimeToPickup.vue`）、店舗情報（`ShopInfo.vue`）、注文停止画面（`OrderSuspendPage.vue`）の日付・曜日・時刻の計算

## 対象外

- 管理画面の一覧（注文一覧・新着の監視など）の `midNight`
- 画面の日時表示（`$d(..., "short")`）。B で JST にするか、C で扱う

## 見つけたが直していないこと

- 店舗情報の「営業中」の判定（`ShopInfo.vue` の `isOpen`）は、曜日を 0〜6（日曜が 0）で取り、営業日のキー "1"〜"7"（日曜が "7"）と比べている。日曜は常に「営業中ではない」になる
