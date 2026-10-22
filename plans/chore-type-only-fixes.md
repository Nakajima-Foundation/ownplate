# vue-tsc の指摘のうち、型だけで直せるものを直す

omochikaeri-docs#202 の一部。**ロジックには触らない。**

## 直したもの

### 1. `qrcode` の型が無い（TS7016）

`@types/qrcode` を開発時の依存に入れる。パッケージは自前の型を持たない。

### 2. `DialogAlertData.title` が必須になっていた（TS2345）

型が実態と合っていなかった。`DialogBox.vue` は `v-if="alert.title"` で出し分けており、
確認だけのダイアログは `code` だけで呼ばれる（`PaymentSection.vue` の Stripe 連携解除など）。
`title?: string` にする。

## 直さないと決めたもの

### props の `type: Object` を `PropType<RestaurantInfoData>` にする（見送り）

**やってみて、ほぼ相殺だった。** `shopInfo` を持つ .vue を全部変換して測った結果:

- 消えた件数と、新たに出た件数がほぼ同じ
- 差し引きの改善はごくわずか

理由は、**props に型を付けると、それまで `any` で素通りしていた template の参照が検査される**ため。
`AdminHeader.vue` 1本で試したときは、自身の指摘は消えたのに**親8本に新しい指摘が出た**
（親が渡している `shopInfo` がまだ `Record<string, any>` なので）。鎖の全部を変えても、
今度は別の種類（添字の型・代入の型）が出る。

**つまりこれは「型だけの修正」ではなく、もっと大きい型付けの入口。** 出てくるものは
`ReportDetails.vue` の「文字列で定数オブジェクトを添字できない」のように、
1つずつ判断が要るものばかり。この PR の範囲を超える。

`shopInfo` の型付け自体は正しい方向なので、やるなら**その先に出る指摘を直す覚悟込み**で
別の課題として立てる。

## 途中で1つ壊した

`src/app/admin/Restaurants/Printer.vue` は `<script>` に `lang="ts"` が無い。そこへ
TypeScript の構文を入れてビルドが落ちた。`vue-tsc` は3件しか報告せず（早期に止まる）、
**`yarn build` だけが原因を指していた**。変換するときは `lang="ts"` の有無を見る必要がある。
