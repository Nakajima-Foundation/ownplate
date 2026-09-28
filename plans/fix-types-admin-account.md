# 管理アカウント（admins/:uid）の型を ShopOwnerData にまとめる

## なぜ

`admins/:uid` の形は `ShopOwnerData` が一部（`partners` / `admin` / `hidePrivacy`）だけを表していた。super 画面は同じ文書を `DocumentData` のまま読んでいた。新しい型を足すと二重になるので、`ShopOwnerData` を文書全体の型にする（2026-09-28 に決めた）。

## やること

- `ShopOwnerData` に、書き手が書いている項目を足す。
  - `name` / `created`（登録画面 `SignUpPage.vue`）
  - `operator`（functions の `super.ts` が custom claim の写しとして書く）
  - `opt_out`（super の管理者詳細）
- `hidePrivacy` を省略可にする。
  - このリポジトリに書き手が無く、読む `getShopOwner` は無い文書を `false` で返している。
  - `ShopOwner.ts` は functions へコピーされていない。functions の `express.ts` は自分で読んでいる。
- `admins/:uid/private/profile` の型 `AdminPrivateProfileData`（`email` / `updated`）を足す。
- 型を当てる所:
  - super のパートナー一覧・プロフィール検索・管理者詳細・管理者一覧
  - 管理トップの `Partners` の props
- `as` を2つ消す。どちらも実行時の動きは変わらない。
  - `getShopOwner` の `as ShopOwnerData`
  - `Partners.vue` の `as ShopOwnerData`

## 実行時の動き

- 値と分岐は変えない。
- 増えるのは、パートナー一覧の `collectionData`（引数をそのまま返す関数）1か所だけ。

## やらないこと

- 管理者一覧の支払い情報（`payment`）。読み込んだあとに `verified` を書き足しているので、型を付けるには書き方を変える必要がある。
- 管理者詳細の custom claim（`customClaims`）。functions から返る任意の鍵の集まり。
