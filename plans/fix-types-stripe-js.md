# Stripe.js に @stripe/stripe-js の型を当てる

## なぜ

Stripe.js は `src/config/header.ts` が head に入れる script（`js.stripe.com/v3`）で読んでいる。型が無いので、次の2か所で型エラーを隠していた。

- `getStripeInstance` の `@ts-expect-error`
- カード入力欄の `ref<any>`

## やること

- 開発用の依存に `@stripe/stripe-js` を足し、型だけを使う（`import type`）。読み込みは今の script のまま。
- `stripe.ts` で、グローバルの `Stripe` を `StripeConstructor` として宣言し、`@ts-expect-error` を消す。
- カード入力欄の `cardElem` を `StripePaymentElement | null` にし、`any` と `eslint-disable` を消す。

## 実行時の動き

変えない。`main` とこのブランチの `dist` を `diff -rq` で比べて同じ。

## 気をつけること

- 読んでいるのは版を固定しない `js.stripe.com/v3`。一方、`@stripe/stripe-js` の型は特定の版に合わせてある。
- 使っているのは `elements` / `create("payment")` / `mount` / `on("change")` / `confirmPayment` / `confirmCardPayment` だけで、どれも型が通った。
