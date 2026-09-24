# 店舗の持ち主判定に、uid が分からない場合を持たせる

SingularitySociety/omochikaeri-docs#216

## 変えたこと

`checkShopAccount` / `checkShopOwner` の第2引数を `string | undefined` と宣言し、
`undefined` のときは一致しない扱いにした。中身は共通の `belongsTo` に寄せてある。

呼び手が渡しているのは `useAdminUids()` の `ownerUid` で、型の上では `string | undefined`。
**宣言のほうが実態より狭かった。**

## なぜ今まで型検査に出なかったか

呼び手の `shopInfo` が `Record<string, any>` になっていて、**第1引数のほうで先に落ちて
いた**ため。片方の嘘がもう片方の嘘を隠していた。

この宣言を直したことで、`shopInfo` に型を付ける作業（`type: Object` の40件）が
初めて効くようになる。そちらは別に扱う。

## 同じ形は全部で3箇所あった

レビューが1巡目で `RestaurantPage.vue` の `isOwner` / `isSubAccount` を、2巡目で
`MenuListPage.vue` の店舗の購読を指摘した。**3箇所目で場当たりをやめ、repo 全体を
`grep` で洗い直した**。uid を比べている箇所はこれで全部守られている。

並べて測った結果は、`RestaurantPage` が128通りで差7件、`MenuListPage` が32通りで差1件。
**どちらも「新しいほうが通してしまう組」は0**（すべて止める方向）。

## 振る舞い

変わるのは**一組だけ**。詳細は #216。試験を足してあり、守りを外すとその1件だけが赤くなる。

## 測定

`vue-tsc` 271 → 266。誤りが増えたファイルは無い（ファイル単位で突き合わせ済み）。
