# feat: 日本の祝日カレンダーを取り込む

SingularitySociety/omochikaeri-docs#70（祝日の設定）の第一歩。

## この PR

- `@holiday-jp/holiday_jp` を追加（MIT、1970〜2050 年の祝日、振替休日・国民の休日を含む）
- `src/utils/holiday.ts` の `isJapaneseHoliday(date)` を入口にする。日付は端末の暦（ローカル時刻の年月日）で読む。受取日の一覧（`pickup.ts` の `midNight`）も同じ暦なので揃う
- まだどこからも呼ばない。画面の動きは変わらない

## 次（案。実装は別 PR）

メニュー設定の「除外日」に「祝日」を足す。

- 保存: `exceptDay` に曜日の `"1"`〜`"7"` と並べて `holiday: true` を持つ。`orderCreated` は `exceptDay` をそのまま写すのでサーバは変更不要
- 管理画面（`MenuItemPage.vue`）: 曜日のチェックボックスの後ろに「祝日」を 1 つ足す。i18n キーを全言語に追加
- 受取日の一覧（`pickup.ts` の `getAvailableDays`）: 臨時休業日と同じ日付ごとの絞り込みに「`exceptDay.holiday` が立っていて、その日が祝日なら外す」を足す。注文画面の受取時刻（`TimeToPickup.vue`）は注文の写しから `exceptDataOf` で集めるので、`holiday` もそのまま集まる
- 店舗ページの商品の「受け取れる曜日」表示（`Menu.vue` / `menuPickupData`）: `hasExceptDay` は `holiday` だけでも真になるので、「祝日を除く」の表示を足さないと全曜日が並ぶだけになる
- 曜日の判定（`businessDays`）は数字の曜日しか見ないので `holiday` は影響しない
- 既存の商品は `holiday` を持たないので挙動は変わらない

データは 2050 年までなので、それより先は祝日として扱われない。祝日法の改正はパッケージの更新で取り込む。
