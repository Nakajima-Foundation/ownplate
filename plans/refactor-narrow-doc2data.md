# doc2data の引数の型を、実際に使う分まで狭める

omochikaeri-docs#204

## 何が問題か

`doc2data` は Firestore の snapshot を受け取るが、中で使うのは **`id` と `data()` の2つだけ**。
それなのに引数の型が `DocumentSnapshot | QueryDocumentSnapshot`（`metadata` / `exists` /
`get` / `toJSON` / `ref` を含む）になっていて、**試験から呼べなかった**。

Firestore から読むデータはほぼ全部ここを通り、呼び手は20ファイル。試験はゼロだった。

## 直す範囲

引数の型を `{ id: string; data: () => DocumentData | undefined }` に狭める。**中身は変えない。**

Firestore の `DocumentSnapshot` も `QueryDocumentSnapshot` もこの形を構造的に満たすので、
呼び出し側は変わらない。

## 呼び手が影響を受けないことの確かめ方

**`tsc` では足りない。** 呼び手20本のうち **16本が `.vue`** で、`tsc` は `.vue` を読まない。
`yarn build` の中の checker も `typescript: true` で素の `tsc` なので同じ。

`vue-tsc` を変更の前後で走らせ、**エラーの集合が一致すること**で確かめる
（件数だけでなく、ファイルと行と種類の組で突き合わせる）。

## やらないこと

`restaurant2AreaObj`（同じ形。omochikaeri-docs#204 にもう一方として書いてある）は触らない。
別の PR にする。
