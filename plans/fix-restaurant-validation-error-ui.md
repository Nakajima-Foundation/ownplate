# 店舗情報編集: バリデーションエラーで保存不可なのに UI に出ない問題の修正

関連 issue: https://github.com/Nakajima-Foundation/ownplate/issues/1748

## 背景・課題

`src/app/admin/Restaurants/Index.vue` で、`shopInfoValidator` のエラーにより保存ボタンが
無効化(`disableSave = hasError && publicFlag`)されているのに、対応するエラー UI が無い項目があり、
「保存できないのに画面に何も出ない」状態になる。

- **完全に不可視(分類A)**: `state`(都道府県), `pickUpDaysInAdvance`(何日前予約)
  - 特に `state` は `defaultShopInfo.state=""` かつ都道府県セレクトに空 option が無いため、
    見た目は先頭の都道府県が選択済みに見えるのに実値は `""` のまま → 無表示で保存不可。
- **枠/色のみでメッセージ無し(分類B)**: `pickUpMinimumCookTime`, `time`(営業時間), `restProfilePhoto`, `restCoverPhoto`
- **validator バグ(分類C)**: `RestaurantPageUtils.ts` がメッセージキーを宙に浮いた `name`
  (グローバル `window.name`)で組み立てており `validationError..tooMuch` のように壊れる。

加えて、`TextForm.vue` は `error` を枠線色にしか使っておらず、メッセージ文言を描画していない
(エラーメッセージを実表示しているのは PhoneEntry のみ)。`validationError` の i18n キーも
大半が未定義。

## 対応方針(本 PR で一括対応)

1. **validator バグ修正**(`src/utils/admin/RestaurantPageUtils.ts`)
   - `name` 誤用を該当フィールド名リテラルへ修正
     (`pickUpMinimumCookTime` の `tooMuch/negative/notNumbery`, `pickUpDaysInAdvance` の `invalid`)。

2. **TextForm にメッセージ表示を追加**(`src/app/admin/inputComponents/TextForm.vue`)
   - `error.length > 0` のとき `$t(error[0])` を赤字で表示。
   - 当コンポーネントは Index.vue 専用のため他画面に影響なし。

3. **State にエラー表示＋未選択明示を追加**(`src/app/admin/inputComponents/State.vue`)
   - `error` プロップを追加し、メッセージ表示と赤枠を追加。
   - 未選択を示す `<option value="" disabled>` を追加(空状態を視覚化)。
   - `Index.vue` で `:error="errors['state']"` を渡す。

4. **Index.vue に残りのメッセージ表示を追加**
   - `pickUpDaysInAdvance`(select 下), `pickUpMinimumCookTime`(input 下),
     `time`(各 hours-input 下), `restProfilePhoto` / `restCoverPhoto`(各画像ブロック下)。

5. **i18n キー追加**(`src/lang/*.ts`、es.ts はスタブのため対象外の9言語)
   - `validationError` 配下に必要キーを全言語へ追加。
     `restaurantName/ownerName/streetAddress/city/state` の `empty`、
     `url/lineUrl/instagramUrl/uberEatsUrl` の `invalidUrl`、
     `pickUpMinimumCookTime` の `tooMuch/negative/notNumbery`、
     `pickUpDaysInAdvance` の `invalid`、
     `restProfilePhoto/restCoverPhoto` の `empty`、
     `oneInEmpty/validBusinessTime/noSelect`。
   - `zip.empty` は既存を流用。

## 確認観点(レビュー時)

- `state` 空のとき: セレクトが未選択表示になり、メッセージ＋赤枠が出て、公開保存が無効になる。
- 各必須項目を空/不正にしたとき、対応するメッセージが該当箇所に表示される。
- 既存の正常系(全項目入力済み)で誤検知が出ない。
- 全言語でメッセージキーが解決される(生キー文字列が出ない)。

## テスト

- 型変更ではなく挙動変更のため、`shopInfoValidator` のメッセージキーが正しく
  該当フィールド名で生成されることを最低限手元で確認。
- フロントは `yarn format` / `yarn lint` / `yarn build` を通す。
