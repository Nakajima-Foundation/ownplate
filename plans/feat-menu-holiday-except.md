# feat: メニューの除外日に「祝日」を足す

SingularitySociety/omochikaeri-docs#70 の残り（店舗の祝日定休は #2042）。

## やること

- 管理画面のメニュー編集: 除外日の曜日のチェックボックスの後ろに「祝日」（`exceptDay.holiday`）。保存の整形（`menu.ts`）は `exceptDay` をそのまま保存するので変更なし
- 受け取れる日の判定（`pickupDays.ts`）: 店が祝日定休か、注文の商品のどれかが祝日を除外していれば、祝日を外す（`HOLIDAY_KEY`）。注文の写し（`orderCreated` がコピーする `exceptDay`）にも入るので、サーバの記録（`pickupCheck`）も同じになる
- 店舗ページの商品（`menuPickupData` / `Menu.vue`）: 曜日の除外の判定から `holiday` を外し、祝日の除外は「※ 祝日は受け取れません」として別の行に出す（祝日だけを除外した商品で、全曜日が並ぶだけになるのを避ける）
- 文言を 9 言語に（es は除外日の文言を持たず en にフォールバックしているので足さない）

## 変わらないこと

- `holiday` を持たない既存の商品の表示と受取日
- 曜日の一覧（`businessDaysOf` / `availableBusinessDays`）は数字の曜日しか見ないので `holiday` の影響を受けない
