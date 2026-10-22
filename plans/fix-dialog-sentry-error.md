# エラーダイアログから Sentry へ、捕まえた例外を送る（omochikaeri-docs#205）

## なぜ

`DialogBox.vue` は、エラーダイアログを出すたびに `Sentry.captureException(error.value?.error)` を呼ぶ。`setErrorMessage` の呼び手18か所のうち、`error` を渡しているのは4か所だけで、残り14か所は `undefined` を送っていた。本物の例外は Sentry に届いていなかった。

## やること

- 例外を捕まえた `catch` の中で呼んでいる12か所で、`error` を渡す。
  - LINE の連携、新規登録、店舗の追加・保存
  - 注文のキャンセル・決済の取り消し・状態の更新
  - Stripe の連携・解除、注文の確定、支払い
- `DialogBox.vue` は、`error` が無いときは Sentry へ送らない。
  - 例外を捕まえずに出すダイアログが2か所ある（注文詳細で、functions が失敗の結果を返したとき：カードのエラーと、更新の失敗）。送る例外が無いのに `undefined` を送っていた。

## 挙動の変化

- Sentry に、12か所の本物の例外が届くようになる。
- 例外の無い2か所は、Sentry への送信が無くなる（これまでは中身の無い `undefined` だった）。
- ダイアログの表示は変えない。

## 確かめていないこと

Sentry の画面で実際にどう記録されるかは見ていない（本番の DSN が要る）。
