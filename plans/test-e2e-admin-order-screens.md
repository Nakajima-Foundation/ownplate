# e2e: 管理画面・スーパー管理画面の一覧と CSV を開く（#2045）

## なぜ
#2044 で、管理画面の全注文 CSV の日付列が `Invalid date` になる所をレビューで見つけた。CI の e2e はこの画面も CSV も開いていなかった。

## やること
- 種まき（`scripts/seedEmulator.ts`）に super の口座を足す。custom claim `admin: true` を付ける。
- `test/e2e-emulator/adminOrderScreens.spec.ts` を足す。注文を1件出してから、次を開く。
  - 管理画面: 注文一覧 / 注文履歴 / 利用者の注文履歴 / 全注文 `/admin/orders`
  - super: `/s/orders`
- 各画面で、その注文のカードが出ること、`Invalid date` がどこにも出ないことを見る。
- CSV（注文履歴の2種、全注文、super の全注文）を落とし、その注文の行の日付列が `YYYY/MM/DD` で始まることを見る。

## やらないこと
- 並び順（`orderHistory.spec.ts` が見ている）。
- 日本以外のタイムゾーンの端末。
