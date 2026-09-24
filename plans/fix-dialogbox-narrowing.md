# エラーダイアログの中で、無いかもしれない値を絞り込む

## 何が起きていたか

`DialogBox.vue` は `dialogStore.dialog?.error` と `?.alert` を computed で持つ。どちらも
`undefined` になりうるのに、読むときに絞り込んでいなかった。`vue-tsc` の誤り6件がこれ。

```js
const errorMessage = computed(() => {
  Sentry.captureException(error.value?.error);   // ここだけ ?. がある
  if (error.value.message) {                     // ここは無い
```

## `?.` を足す形にしなかった理由

`alert.value?.callback()` にすると、**呼べないときに黙って何もしなくなる**。例外より
追いにくい。値が無いときに何を返すかを決めるほうが、読む側にも分かる。

```js
const current = error.value;
if (!current) {
  return "";
}
```

## 実際に変わること

いまの template は `<div v-if="error">` の中でしか `errorMessage` を読まず、`handleYes` は
alert が出ているときしか押せない。**したがってこの経路は現状たどり着かない。**

たどり着いた場合の振る舞いだけが変わる。

|                                | 前                                     | 後                               |
| ------------------------------ | -------------------------------------- | -------------------------------- |
| `error` が無いときに文面を読む | Sentry に `undefined` を送ってから例外 | `""` を返す。Sentry には送らない |
| `alert` が無いのに「はい」     | 例外（閉じない）                       | 何もしない（閉じない）           |

どちらも「例外が出なくなる」方向で、閉じる・閉じないは変わらない。

## 測ったこと

|                      | 前  | 後   |
| -------------------- | --- | ---- |
| `vue-tsc` 全体       | 446 | 440  |
| `DialogBox.vue`      | 6   | 0    |
| 誤りが増えたファイル | —   | なし |
