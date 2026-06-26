# メニュー編集: itemName/price のバリデーションエラーメッセージを UI に表示

関連 issue: https://github.com/Nakajima-Foundation/ownplate/issues/1750
先行する同種修正(店舗情報編集): #1748 / PR #1749

## 背景・課題

`src/app/admin/Restaurants/MenuItemPage.vue` の必須項目 `itemName` / `price` は、バリデーション
エラー時に赤枠が出るだけでエラーメッセージ文言が出ない(#1748 修正前の TextForm と同様)。
原因項目を文言で明示する。

- `validationError.itemName.empty` / `price.empty` の i18n キーは未定義。
- `tax`(税区分)のエラーが UI に出ない問題は、既定 "food" で新規では起きず稀なため**据え置き**
  (本 PR では扱わない)。

## 対応方針(本 PR)

1. **itemName / price**(`MenuItemPage.vue`)
   - 入力欄の下にエラーメッセージ文言(赤字)を表示。
2. **i18n**(`src/lang/*.ts`、es.ts はスタブのため対象外の9言語)
   - `validationError.itemName.empty` / `price.empty` を追加。

## 確認観点

- 商品名 / 値段を空にすると、各入力欄の下にメッセージが表示される。
- 正常系で誤検知が出ない。全言語でキーが解決される。

## テスト

- フロントは `yarn format` / `yarn lint` / `yarn build` を通す。
