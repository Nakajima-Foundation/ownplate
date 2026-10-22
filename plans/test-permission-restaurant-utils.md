# 権限の判定・店舗の並べ替え・PDF の単位変換に試験を足す

omochikaeri-docs#196 の続き。**実装には触らない。**

## 対象

- `src/utils/userPermission.ts` — `checkShopAccount` / `checkShopOwner`
- `src/utils/RestaurantUtils.ts` — `sortRestaurantObj`
- `src/lib/pdf/pdfStyles.ts` — `convMm2pt`

## 留める規則

- **権限の判定は uid の完全一致。** 大文字小文字も区別する
- **`checkShopAccount` と `checkShopOwner` は中身が同じ。** 違いは呼び出し側が渡す uid
  （親の uid か、署名した本人の uid か）で、関数の中には無い。コメントは
  「allow subAccounts」「only owner」と書いてあるが、その差は関数には現れない
- **`sortRestaurantObj` は並べ替えた配列ではなく `undefined` を返す。** 呼び出し側は引数のほうを読む
- **`convMm2pt` は1インチ（25.4mm）を72ptにする**（定義）。小数は2桁

## 試験していないもの

`restaurant2AreaObj` は入れていない。実際に使うのは `doc.id` と `doc.data()` だけなのに、
引数の型が `QueryDocumentSnapshot`（`metadata` / `exists` / `get` / `toJSON` / `ref` を含む）
なので、`as` を使わずに満たす値が作れない。

引数の型を `{ id: string; data(): ... }` まで狭めれば試験できるようになるが、それは実装の変更。
別の作業にする。

## 途中で1つ直した

`convMm2pt` の期待値を最初は**実装と同じ式で計算していた**ため、係数 `0.35278` を変えても
小数の桁を落としても試験が緑のままだった。実際の数（1インチ=72pt、54mm=153.07pt）で
書き直したら、どちらの変異も赤になった。
