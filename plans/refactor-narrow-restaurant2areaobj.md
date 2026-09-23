# restaurant2AreaObj の引数の型を、実際に使う分まで狭める

omochikaeri-docs#204（`doc2data` と対になるもう一方）

## 何が問題か

`restaurant2AreaObj` は Firestore の snapshot を受け取るが、中で使うのは **`id` と `data()` の
2つだけ**。それなのに引数の型が `QueryDocumentSnapshot`（`metadata` / `exists` / `get` /
`toJSON` / `ref` を含む）になっていて、**試験から呼べなかった**。

店舗一覧を都道府県ごとに束ねる関数で、束ね漏れるとその県の店舗が一覧から消える。試験はゼロだった。

## 直す範囲

引数の型を `{ id: string; data: () => RestaurantInfoData }[]` に狭める。**中身は変えない。**

あわせて実装内の `doc.data() as RestaurantInfoData` が不要になるので外す。型を狭めたことで
`data()` の戻りがそのまま `RestaurantInfoData` になるため、キャストする理由が消える。

## 呼び手が影響を受けないことの確かめ方

`doc2data` のときと同じ。**呼び手2本はどちらも `.vue` で、`tsc` は `.vue` を読まない。**
`yarn build` の中の checker も素の `tsc` なので同じ。

`vue-tsc` を変更の前後で走らせ、診断の集合が一致することで確かめる。

## やらないこと

`sortRestaurantObj` と `imageUtils` には触らない。前者は既に試験がある。
