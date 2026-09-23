# template が存在しない項目を読んでいる箇所を直す

omochikaeri-docs#202 のうち、実物を確認できた2件。

## なぜ溜まったか

`.vue` の template は型検査されていない（`vite-plugin-checker` は `typescript: true` で素の
`tsc` を走らせ、`tsc` は SFC の中身を読まない）。綴りを間違えても**エラーにならず、黙って
何も表示しない**ので、こうして残る。

## 直すもの

### 1. 店舗カードのプロフィール写真が一度も出ていない

`src/app/user/RestaurantCard.vue`

```html
<img v-if="shopInfo.restaurantProfilePhoto" :src="shopInfo.restaurantProfilePhoto" ... />
```

`shopInfo` は Firestore から読んだ `RestaurantInfoData`。項目名は **`restProfilePhoto`**。
`restaurantProfilePhoto` は存在しないので `v-if` が常に偽になり、**`<img>` が描かれない**。
店舗名の横に写真が出ないまま。

管理画面（`Restaurants/Index.vue`）は `restProfilePhoto` で書いている。

### 2. 注文画面の送料に空の行が出ている

`src/app/user/OrderPage/OrderInfo.vue`

```html
{{ orderInfo.shoppingCost }}
<div class="text-base">{{ $n(actualShippingCost, "currency") }}</div>
```

項目名は **`shippingCost`**。`shoppingCost` は存在しないので空文字が描かれる。すぐ下に
正しい送料が出ているので、余分な空行が1つ増えるだけ。その行を消す。

## 確かめ方

`vue-tsc` を前後で走らせ、この2つに由来する指摘が消えて、**新しい指摘が増えていない**ことを見る。
行を消すと後続の行番号がずれるので、件数だけでなく中身を突き合わせる。

## レビューで足したもの

写真が**初めて表示されるようになる**ので、URL が古い・消えている場合に壊れた画像が出る。
repo に既にある `smallImageErrorHandler` を `@error` に繋いだ（`MenuItemPage.vue` が同じ形で
使っている）。これは私の変更が直接生んだ危険で、Codex が指摘したもの。

## やらないこと

FAQ の `faq.answers1` / `type1` などの描かれない枝には触らない。顧客向けの `/faq` は
`answers: ["ほげほげ"]` という仮データのままで、**内容をどうするかの判断が要る**。別の課題にする。
