# restaurant2AreaObj の引数の型を、実際に使う分まで狭める

omochikaeri-docs#204（`doc2data` と対になるもう一方）

## 何が問題か

`restaurant2AreaObj` は Firestore の snapshot を受け取るが、中で使うのは **`id` と `data()` の
2つだけ**。それなのに引数の型が `QueryDocumentSnapshot`（`metadata` / `exists` / `get` /
`toJSON` / `ref` を含む）になっていて、**試験から呼べなかった**。

店舗一覧を都道府県ごとに束ねる関数で、束ね漏れるとその県の店舗が一覧から消える。試験はゼロだった。

## 直す範囲

引数の型を `{ id: string; data: () => DocumentData }[]` に狭める。**中身は変えない。**

`data()` の戻りは `DocumentData` のままにする。**`RestaurantInfoData` まで狭めてはいけない** —
Firestore の `data()` は `DocumentData` を返すので、呼び出し側が通らなくなる。
一度そうしてしまい、`vue-tsc` が呼び出し箇所ちょうど2件にエラーを出した。実装内の
`as RestaurantInfoData` はそのため残る（もとからあったもの）。

## 呼び手が影響を受けないことの確かめ方

`doc2data` のときと同じ。**呼び手2本はどちらも `.vue` で、`tsc` は `.vue` を読まない。**
`yarn build` の中の checker も素の `tsc` なので同じ。

`vue-tsc` を変更の前後で走らせ、診断の集合が一致することで確かめる。

**これが効いた。** 一度キャストを外そうとしたとき、`yarn typecheck` / `yarn lint` / `yarn test` /
`yarn build` はすべて通ったのに、`vue-tsc` だけが呼び出し箇所2件を捕まえた。`tsc` は `.vue` を
読まないので、他のどのゲートにも見えていなかった。

## やらないこと

`sortRestaurantObj` と `imageUtils` には触らない。前者は既に試験がある。
