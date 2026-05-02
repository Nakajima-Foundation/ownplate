# U-HIGH-3: SignUp ボタンに submitting ガード追加

Issue: #1696
Refs: `omochikaeri-docs/Docs/code_review_vue_2026-04-30.md` U-HIGH-3

## 問題

`src/app/auth/SignUpPage.vue` の `onSignup` は async で複数の Firestore / Auth 操作を順に実行する。

現状の submit ボタン:

```vue
<t-submit :isDisabled="submitted && Object.keys(errors).length > 0">
```

`errors` が空の正常系では `:isDisabled` が常に `false` のままで、async 処理中もボタンが押せる。連打すると `createUserWithEmailAndPassword` が複数回走り、2 回目以降は `auth/email-already-in-use` で失敗する想定だが、防御的ではない。

`generalStore.setLoading(true)` でグローバルなローディング表示は出るが、ボタン自身は disabled にならず、a11y/UX 上も望ましくない。

## 修正方針

1. `submitting` ref を追加 (in-flight フラグ)
2. `onSignup` 内で hasError チェック後に `submitting.value = true`、finally で false にリセット
3. `:isDisabled` を `submitting || (submitted && Object.keys(errors).length > 0)` に変更
4. setup の return に `submitting` を追加

## 変更ファイル

- `src/app/auth/SignUpPage.vue` のみ

## 影響範囲

- 機能変更なし（防御的ガードのみ）
- 既存の `setLoading` 連動オーバーレイ表示と並列に動作

## 検証

- `yarn lint` / `yarn build` 成功
- 手動 UI テストは不要（防御的ガード、submit ボタンが押せなくなるだけ）
