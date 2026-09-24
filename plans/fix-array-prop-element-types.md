# 一覧を受け取る prop に、要素の型を与える

#1881 の続き。`type: Array` だけの prop は要素が `unknown` になるので、template が読む欄が
全部「unknown のまま読んでいる」と言われる。**呼び手から要素の型を確かめられたものだけ**を
入れる。

| 場所 | 値 | 型の出どころ |
| --- | --- | --- |
| `Restaurant/Titles.vue` | `titleLists` | `RestaurantPage.vue` が `useTitles` の `ref<TitleData[]>` から組み立てる |
| `components/ToggleSwitch2.vue` | `toggleValues` | 唯一の呼び手 `MenuListPage.vue` の定数配列 `{ name, value }` |
| `OrderPage/OrderInfo.vue` | `orderItems` | `getOrderItems` の戻り。`OrderItemData[]` |
| `OrderPage/AfterPaid.vue` | `orderItems` | 同上。**下記** |

## `AfterPaid.vue` を巻き込んだ理由

`OrderInfo.vue` だけ型を付けたら、`AfterPaid.vue` が1件増えた。**同じ prop を素の `Array` で
受けて `OrderInfo` へ渡していた**ので、そこを直さないと型が合わない。

`orderItems` を受け取る部品は4つあり、`BeforePaid.vue` と `Pay.vue` は元から
`OrderItemData[]` と宣言していた。残っていたのがこの2つ。

書き方は `as` を使わない `Array<T>` にしてある（`BeforePaid` / `Pay` は
`Array as PropType<OrderItemData[]>`）。誤りの出ていないその2つは触っていない。

## 出力が変わらないことの確かめ方

**読んで判断していない。** 4ファイルの `<script>` を変更の前後で取り出し、同じ名前で
esbuild に通して**出力を突き合わせた。4つとも完全に一致**（12・30・154・174行）。
行数も見て、空の出力を掴んでいないことを確かめてある。

型は `import type` で取っているので、値としての import は増えない。
