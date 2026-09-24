# 提携先の一覧の描き方を、`getPartner` の約束に合わせる

SingularitySociety/omochikaeri-docs#214

## 変えたこと

`getPartner`（`src/utils/utils.ts`）は、引き当たらない id を `undefined` のまま配列に残す。
これは意図された約束で、`test/unit/test_utilsComposables.ts` の
`leaves a hole rather than dropping an id it does not know` が留めている。コメントも
「表示側は穴を考えなければならない」と書いている。

**表示側をその約束に合わせた。** 該当は2箇所。

- `src/app/admin/Index/Partners.vue`
- `src/app/admin/Restaurants/Wrapper.vue`

Vue 3 では `v-if` と `v-for` を同じ要素に置くと繰り返しの変数が見えないので、
`<template v-for>` で包んで中の `div` に `v-if` を置いた。

`getPartner` 側は触っていない。

## 同じ振る舞いであることの確かめ方

**読んで判断していない。** 実物の template 文字列を Vue のコンパイラにそのままかけ、
旧と新を並べて描いた（`createSSRApp` + `renderToString`）。

並びは、穴なし・空・穴が先頭・穴が末尾・穴が真ん中・穴だけの6通り。
**穴が無い場合と空の場合は、見える出力が完全に一致する。**
それ以外の差については #214 を参照。

`<template v-for>` は SSR の出力に断片の印（`<!--[-->`）を足すが、これはコメントなので
画面には出ない。この app は SSR していない（Vite の SPA）。印を除いて比べている。
harness は内容を変えると違う結果になることを確かめてある。

両ファイルとも `<style>` ブロックを持たないので、断片根で scoped な CSS が効かなくなる
問題には当たらない。
