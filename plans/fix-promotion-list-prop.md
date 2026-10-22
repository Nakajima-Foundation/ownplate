# 割引の一覧を受け取る prop に、要素の型を与える

## いまの形

`FloatingBanner.vue` の `possiblePromotions` が `type: Array` だけなので要素は `unknown`
になり、template が読む欄が全部「unknown のまま読んでいる」と言われていた。10件。

## 変えたこと

`type: Array<Promotion>` にした。`Promotion`（`src/models/promotion.ts`）は
template が読む欄をすべて持っている — `promotionName` / `discountMethod` /
`discountValue` / `hasTerm` / `termFrom` / `termTo` / `discountThreshold` /
`usageRestrictions`。

呼び手（`RestaurantPage.vue`）が渡すのは `props.promotions.filter(...)` の結果で、
その `promotions` も `type: Array<Promotion>` と宣言されている。**同じ書き方に揃えただけ。**

`Promotion` は型としてしか使わないので `import type` で取る。

## 出力が変わらないことの確かめ方

**読んで判断していない。** `<script>` を変更の前後で取り出し、同じ名前で esbuild に通して
**出力を突き合わせた。完全に一致**（30行）。`Array<Promotion>` は型引数なので消える。
`import type` にする前も後も一致することを両方で確かめてある。

## 残した同じ形

`type: Array` のままの prop は他にもある。

```
grep -rn "type: Array," src/ --include="*.vue"
```

今回はそのうち**要素の型が呼び手から確かめられた1つ**だけを入れた。
