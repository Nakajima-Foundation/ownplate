# X-HIGH-1 (partial): 未使用 cancel reasons 定数の削除

Refs: `omochikaeri-docs/Docs/code_review_vue_2026-04-30.md` X-HIGH-1

## 問題

`src/config/constant.ts:292-344` に `placedCancelReasons` / `acceptedCancelReasons` 定数（各 6 件、日本語ハードコード）。

X-HIGH-1 として「constant.ts に大量の日本語ハードコード」として指摘された対象だが、コードベース全体検索で **参照ゼロ**を確認。i18n 化議論不要、削除のみ。

## 検証

\`\`\`bash
grep -rn 'placedCancelReasons\|acceptedCancelReasons' src/ functions/src/
\`\`\`

`src/config/constant.ts` の宣言と `functions/src/common/constant.ts` のコピーのみ。`functions/src/common/` は `src/` からの自動コピー先で、次回 deploy 時に同期される。

## 変更ファイル

- `src/config/constant.ts` のみ（53 行削除）

## 影響範囲

- 未使用定数削除のみ、機能影響なし
- `yarn build` 通過済み

## 残作業 (X-HIGH-1 全体)

本 PR は X-HIGH-1 の一部のみ。残り（`toBeOrNotSelect` / `partners.name` / Twilio TwiML 等）は別 PR で。
