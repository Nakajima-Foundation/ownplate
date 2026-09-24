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

## helper 自体も直した

レビューで、helper が「何でも受ける」と言いながら **在否の判定と読みが try の外**にあり、
Proxy の `has` 罠や投げる getter で素通りして投げる、と指摘された。#1873 の
`inputValueOf` とまったく同じ形で、**3度目**だったので、同じ形に揃えた
（判定も読みも try の中、読みは一度だけ）。

試験も足してある。投げる getter / `has` を拒む Proxy / 失効した Proxy / 読むたびに
変わる accessor。守りを外すと、その3件だけが赤くなる。

## `.catch` の2箇所も通した

`.catch((error) => ...)` は callback の引数が `any` になるので型検査に出ない。
`SignInPage.vue` と `ResetPasswordPage.vue` がその形で `error.code` を読んでいた。
**同じ族なので一緒に通した。**

`SignInPage` の引数には型を付けていない。下の `getMultiFactorResolver` が Firebase の
誤りをそのまま要求するので、`unknown` にすると渡せなくなる。読むほうだけ helper に通した。

`ResetPasswordPage` は `apiError` が `ref(null)` で型が `null` だったので
`ref<string | null>(null)` にした。

## `.catch` の振る舞いの確かめ方

旧と新を並べて走らせた。Firebase の誤り（MFA 要求・未登録メール・誤ったパスワード・
その他）、素のオブジェクト、`code` が数値、`code` が無い、`null`、`undefined`、文字列。
突き合わせたのは **分岐の結果・書き込まれる値・画面に出るかどうか**。

**Firebase が実際に投げる5形すべてで一致。** 差は非 Firebase の形だけで、`null` と
`undefined` では旧が例外になっていた。
