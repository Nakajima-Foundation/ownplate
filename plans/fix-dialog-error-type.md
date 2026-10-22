# エラーダイアログの型に、実際に渡している欄を足す

## 何が起きていたか

`DialogErrorData`（`src/store/dialog.ts`）は `message?` / `message2?` / `code?` だけを
宣言していた。ところが

- **渡す側**: `setErrorMessage` の呼び手18箇所のうち4箇所が、捕まえた例外を `error` として
  渡している（`Restaurants/Index.vue:1482`、`MenuItemPage.vue:1152`、
  `AfterPaid.vue:363`、`RestaurantPage.vue:728`）
- **読む側**: `DialogBox.vue:87` が `error.value?.error` を読んで Sentry に渡している

**両方が `error` を使っているのに、型だけが知らない**状態だった。余剰プロパティは実行時に
素通りするので、その4箇所ぶんは動いている。

`vue-tsc` はこれを4件の誤りとして出していた。

```
TS2353: Object literal may only specify known properties,
        and 'error' does not exist in type 'DialogErrorData'.
```

## 直し方

型に足すだけ。

```ts
interface DialogErrorData {
  message?: string;
  message2?: string;
  code?: string;
  error?: unknown;
}
```

## 測ったこと

|                      | 前  | 後   |
| -------------------- | --- | ---- |
| `vue-tsc` 全体       | 486 | 481  |
| 誤りが増えたファイル | —   | なし |

型の宣言だけなので、出力される JavaScript は変わらない。

## 残る本題は別

**18箇所のうち14箇所は Sentry に何も渡していない。** 渡すべきか渡さない設計かは判断が要るので
この変更には含めない。SingularitySociety/omochikaeri-docs#205 に残してある。

（その issue には当初「`.error` を渡す呼び手が無い」と書いていたが、数え直して4箇所あることが
分かったので訂正済み。）
