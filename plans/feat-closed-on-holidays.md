# feat: 店舗設定に祝日定休日を足す

SingularitySociety/omochikaeri-docs#70。メニューの除外日の「祝日」は別の PR。

## やること

- 店舗設定の臨時休業の下に「祝日を定休日にする」（`closedOnHolidays`）。オンなら祝日は受け取れない日になる
- その下に、今日（JST）から翌年の年末までの祝日を日付・曜日・名前で並べる（誤解がないように）
- 受け取れる日の判定（`pickupDays.ts` の `availablePickupDays`）で、`closedOnHolidays` の店は祝日を外す。祝日かどうかは呼ぶ側が `isHoliday` で渡す（必須。画面は `usePickupTime`、サーバは `orderPlace` の記録 `pickupCheck` が同じ `isJapaneseHoliday` を渡す）
- 保存（`shopInfoPayload.ts`）と既定値（`shopInfoForm.ts`）、`RestaurantInfoData.closedOnHolidays`
- 文言を全言語に（es は臨時休業の文言も持たず en にフォールバックしているので、合わせて足さない）

## 祝日のパッケージを更新に強くする

`@holiday-jp/holiday_jp` は定期的に更新する前提。

- 祝日のデータは保存も複製もしない。店舗に保存するのは真偽値だけで、判定と一覧は毎回パッケージから読む。パッケージを更新すれば画面もサーバもそのまま新しい祝日になる
- パッケージを読むのは `src/utils/holiday.ts` だけ（`isJapaneseHoliday` / `holidaysBetweenKeys` / `holidaysThroughNextYear`）。API が変わっても直すのはここだけ
- 一覧はパッケージの `between` を使わず、祝日のデータを JST の日付の文字列で絞る（`between` は端末の暦で日付を読むため）
- functions にもパッケージを入れる。ルートと functions で指定（package.json）も入っている版（yarn.lock）も揃っていることを `test/unit/test_holidayPackage.ts` で確かめる。片方だけ更新すると赤くなる
- 試験で祝日の日付を固定するのは過ぎた年だけにし、これから先の分は「範囲に収まる・順に並ぶ・判定と一覧が食い違わない」で見る
- パッケージの 1 件は読むときに形を確かめる（`japaneseHolidayOf`）。日付か名前が無い件は落とし、英語名が無ければ日本語名を出す

## 更新の手順

```bash
yarn upgrade @holiday-jp/holiday_jp
(cd functions && yarn upgrade @holiday-jp/holiday_jp)
yarn test   # test_holidayPackage が両方の版が揃っているかを見る
```
