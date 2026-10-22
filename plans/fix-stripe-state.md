# 支払いの状態を、値そのものとして一度だけ読む

## いまの形

`OrderedInfo.vue` と `OrderInfoPage.vue` の template が `order.payment.stripe` を
直接読んでいる。`payment` は現地払いの注文には無いので省略可で、10箇所が
「無いかもしれない」と言われていた。

読みはどれも `v-if="hasStripe"` の中にあるので実際には守られているが、
**その `hasStripe` は真偽値ではなく `payment?.stripe` の値そのもの**だった。
つまり template は、すでに手元にある値を、もう一度たどり直して読んでいた。

## 変えたこと

`hasStripe` を `stripeState` に改名し、template はそれを読むようにした。
`order.payment.stripe` という読みは両ファイルから無くなった。

名前も直した。`has` で始まるのに文字列を返すので、読む側が中身を見ないと分からない。

## 同じ振る舞いであることの確かめ方

**読んで判断していない。** 旧と新を並べて走らせた。

`payment` の形（無い・`null`・空・`stripe` が `undefined` / 空文字 / `pending` /
`canceled` / `succeeded` / `0` / `false`）を総当たりし、**守りが通るか・`StripeStatus` に
渡る値・i18n の鍵・取り消し済みかの判定・裏の枝が出るか**を突き合わせた。
20件すべて一致。harness は壊して効きを確かめてある。

他のファイルにも `hasStripe` はあるが（`PaymentSection.vue` は店舗の Stripe 連携、
`AfterPaid.vue` は客側）、別の値なので触っていない。

## 確かめていないこと

注文の詳細画面を開いて、カード決済と現地払いの両方を見てはいない。
