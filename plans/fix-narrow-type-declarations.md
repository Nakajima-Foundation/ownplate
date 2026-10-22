# 宣言が実態より狭い2箇所を、既にある宣言に合わせる

どちらも**型引数を足す／差し替えるだけ**で、出力される JavaScript は変わらない。

## `StripeCard.vue` の `storedCard`

`ref(null)` なので型は `null` になり、画面が読む `brand` / `last4` / `exp_month` /
`exp_year` が全部「無い」と言われていた。

`RestaurantCard.vue` が**同じ値に同じ形の宣言をすでに持っている**ので、それに合わせた。
（推測ではなく、この repo の中にある宣言を写している。）

## `components/CustomerInfo.vue` の `customer`

prop の型が `{ location: { lat: number; lng: number } }` だけになっていて、画面が読む
`zip` / `prefecture` / `address` / `name` / `email` が「無い」と言われていた。
`src/models/customer.ts` の `CustomerInfo` がまさにその形なので、それに差し替えた。

モデル側では `location` が省略可になるが、**この部品は元から `v-if="customer.location && ..."`
と `props.customer?.location` で守っている**ので、読む側は変わらない。

呼び手は2つ（`UserCustomerInfo.vue` と `OrderInfoPage.vue`）で、どちらも `{}` から始まる
値を渡している。モデルの欄はすべて省略可なので、そちらの誤りも一緒に消える。

## 出力が変わらないことの確かめ方

**読んで判断していない。** 両ファイルの `<script>` を変更の前後で取り出し、同じ名前で
esbuild に通して**出力を突き合わせた。どちらも完全に一致**した（131行と81行）。
行数も見て、空の出力を掴んでいないことを確かめてある。

## 入れなかったもの

`ECCustomer.vue` の `addressList = ref([])` も同じ族（`never[]` になる）だが、書き手が
`addressList.value = data?.addresses` で **`undefined` を入れうる**。型を付けると代入側を
直すことになり、それは実行時の変更なので別にする。
