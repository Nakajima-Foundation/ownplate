# 買い物かごを一度だけ読んで、型で絞れるようにする

## いまの形

`cartStore.carts` は `{ [key: string]: Cart | null }` と正しく型が付いている。
それを読む2箇所が、こう書いていた。

```ts
if (cartStore.carts[restaurantId.value]) {
  const cart = cartStore.carts[restaurantId.value] || {};
```

`|| {}` が型を `Cart | {}` に広げるので、そのあとの `cart.orders` などが
「`{}` にその欄は無い」と言われる。直前の `if` で守っているので `|| {}` は要らないが、
`restaurantId.value` は ref の読みなので TypeScript が `if` から絞ってくれない。

## 変えたこと

**一度 `const` で受けてから、それを守る。** `|| {}` は消えた。

```ts
const cart = cartStore.carts[restaurantId.value];
console.log(cart);
if (cart) {
  orders.value = cart.orders || {};
```

もう1箇所（`defaultHowToReceive`）は `if` の入れ子が1段減って `cart?.howtoreceive` になった。
そちらは誤りが出ていなかったが、同じ形なので揃えた。

## 同じ振る舞いであることの確かめ方

**読んで判断していない。** 旧と新を並べて走らせた。

かごの値（未登録・null・undefined・空・`howtoreceive` が偽値・揃っている・欄が全部偽値）
× 店舗 id（在る／無い）× 配達専用かどうか、で総当たり。返る値・書き込まれる値・
`console.log` に渡る値まで突き合わせた。

**差が出たのは「読むたびに値が変わる getter」の形だけ。** これは規則どおりで、
`carts[id]` を **1回しか読まなくなった**ことによる。

| | |
|---|---|
| 規則『新は1回だけ読む。旧はそれ以上』 | 20/20 |
| 値が変わらないときの結果一致 | 20/20 |

`carts` は ref の中の素のオブジェクトで、旧の読みの間には `console.log` しか無く、
store を書き換えるものは挟まっていない。読むたびに値が変わることは起きない。

## 確かめていないこと

かごに商品を入れてから店舗ページへ戻る操作を実際に踏んでいない。
