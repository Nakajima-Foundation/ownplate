# getShopOwner を切り出して utils.ts を Firebase から切り離す

omochikaeri-docs#199

## 何が問題か

`src/utils/utils.ts` は先頭で `src/lib/firebase/firebase9.ts` を読む。あちらは module の先頭で
`initializeApp` と `initializeAppCheck`（reCAPTCHA）を呼び、`location` と `self` を使う。
そのため `utils.ts` から1つでも import したファイルは、読み込んだ時点で Firebase を初期化する。

`utils.ts` の中で Firebase を実際に使っているのは **`getShopOwner` の1行だけ**だった。
他の Firebase 由来の取り込みはすべて型（`User` / `DocumentData` / `DocumentSnapshot` /
`QueryDocumentSnapshot`）。

## 直す範囲

- `getShopOwner` を `src/utils/shopOwner.ts` へ出す。**中身は変えない**
- `utils.ts` から `db` の取り込みと `doc` / `getDoc` を外し、型は `import type` に寄せる
- 呼び手3ファイル（`admin/Index.vue` / `Restaurants/OrderInfoPage.vue` / `Restaurants/Wrapper.vue`）
  の import を付け替える

## 確かめ方

`utils.ts` が node から読めるようになること自体を試験で留める。`test/unit/test_cartPricing.ts` は
`utils.ts` を import してカートの金額を計算するので、Firebase が戻れば **import の時点で落ちる**。

そのうえで、移動の前後で `getShopOwner` の中身が同一であること、既存のゲートが通ること。

## やらないこと

`src/lib/pdf/pdf.ts` と `pdf2.ts` は、これでも node から読めない。`location.protocol` を
module の先頭で読むため。Firebase とは別の問題なので触らない。
