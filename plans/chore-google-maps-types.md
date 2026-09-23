# Google Maps の型を入れる

omochikaeri-docs#202 の一部。

## 何が問題か

`Delivery.vue` と `Restaurants/Index.vue` が Google Maps の `google` 大域変数を使っているが、
型定義が無い。`vue-tsc` を走らせると `Cannot find name 'google'` が **23件**出る。

不具合ではない。Google Maps は script タグで読み込まれていて実行時には存在する。
型が無いだけ。

## やること

- `@types/google.maps` を開発時の依存に入れる
- `tsconfig.json` の `types` に `"google.maps"` を足す

**`types` が明示指定されているので、パッケージを入れるだけでは効かない。** 入れただけの状態で
測ったら件数は1件も変わらなかった。`types` に列挙して初めて拾われる。

## 効果

`vue-tsc` の件数: **1105 → 1070**。`google` の23件が消え、それに連なる分も減った。

`vue-tsc` は導入していないので、**いまのゲートの結果は何も変わらない**。導入するときに
その分だけ小さく始められる、という準備。

## 確かめ方

`types` から `"google.maps"` を外すと23件に戻ることを確認する（空振りでないこと）。
既存のゲートがすべて通ること。
