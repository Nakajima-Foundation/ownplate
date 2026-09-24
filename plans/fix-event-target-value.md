# 入力欄の値の取り出しを一つの純関数にまとめる

## いまの形

`Event.target` は型の上では `null` になりうるので、`e.target.value` と読んでいる
9箇所がすべて「無いかもしれない」と言われていた。3ファイル。

- `HoursInput.vue` — 営業時間の開始／終了を `<select>` から受ける handler が2つ
- `TextForm.vue` — template の `@input="input($event.target.value)"` が2つ
- `Restaurant/Menu.vue` — template から `updateSelectedOptions` に渡している1箇所

## 変えたこと

`src/utils/domEvent.ts` に `inputValueOf(event)` を切り出した。純関数なので単体試験がある。
repo は既に `instanceof HTML*Element` で守っている箇所が3つあり、そこと同じ考え方。

`HoursInput.vue` の `isNull(e.target.value) || e.target.value === ""` は
`inputValueOf(e) === ""` になった。`inputValueOf` が空欄を `""` で返すので、
`isNull` の枝は要らなくなる。

**数値を捨てない形にしてある。** `{ value: 540 }` のような形でも `"540"` を返す。
最初は文字列だけを受ける形で書いたが、それだと旧が `540` を書き込む場面で新が
欄を消してしまい、値を静かに失う方向の差が出た。

## 同じ振る舞いであることの確かめ方

**読んで判断していない。** 旧と新を並べて走らせた。

`target` の形（空の入力欄・`540`・`0`・数字でない文字列・空白・`null`・`undefined`・
`value` が無い・`value` が `null`・`value` が数値・prototype 経由）× 既存の枠の状態4通り
× 開始／終了、で総当たり。書き込まれる枠の中身と例外の種類まで突き合わせた。

| | |
|---|---|
| 比較 | 88 |
| 一致 | 72 |
| 差 | 16 |

**差が出るのは `target` が `null` / `undefined` の形だけ**で、旧は例外、新は空欄として
扱う。`HoursInput` の handler は `<select>` に結び付いているので `target` は必ず入る。
harness は壊して効きを確かめてある。

## 確かめていないこと

営業時間の編集画面と、商品の選択肢の入力を実際に触っていない。
