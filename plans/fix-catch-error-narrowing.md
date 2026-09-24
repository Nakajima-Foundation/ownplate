# catch で捕まえたものを、既にある helper で読む

## いまの形

`catch (e)` の中身は `unknown` なので、`e.code` / `e.message` を素で読むと型検査に出る。4件。

- `src/app/user/RestaurantPage.vue` — `console.error(error.message)`
- `src/components/Auth/TotpVerification.vue` — code のログ・message のログ・code での分岐

## 変えたこと

**`src/utils/utils.ts` に `errorCode` と `errorMessage` が既にある。** 6箇所以上で使われて
いる形なので、残っていた4箇所をそれに揃えただけ。新しい道具は作っていない。

## 同じ振る舞いであることの確かめ方

**読んで判断していない。** 旧の読み方と helper を並べて走らせた。

捕まえうるもの: `Error` / `code` と `message` を持つ Firebase 風 / 素のオブジェクト /
`code` が数値 / `message` が数値 / 欄が無い / prototype 経由 / `null` / `undefined` /
文字列 / 数値 / `message` の getter が投げる。

突き合わせたのは **ログに渡る値・`code` の比較結果（分岐を決めるもの）・`code` のログ**。

| | |
|---|---|
| 比較 | 12 |
| 何かが違うもの | 4 |
| **分岐（利用者が見る結果）が違うもの** | **2 — `null` と `undefined` のときだけ** |

`null` / `undefined` では旧が**分岐に届く前に例外**になっていた。残り2件の差は
「`code` や `message` が文字列でないときログに `undefined` と出る」だけで、分岐は同じ。

`message` の getter が投げる場合は helper も投げる（握り潰していない）ことも確かめてある。

## 入れなかった同じ形

`.catch((error) => ...)` の形は引数が `any` になるので型検査に出ない。
`SignInPage.vue` と `ResetPasswordPage.vue` がその形で `error.code` を読んでいる。
型検査の合図が無いぶん別に扱う。
