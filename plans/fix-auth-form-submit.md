# 認証画面の form ボタンが二重送信・誤送信する

omochikaeri-docs#163

## 何が起きていたか（実機で再現）

form の中のボタンは `type` を書かないと submit として振る舞う。`t-button`（`button.vue`）も
素の `<button>` も `type` を持たないので、form に置くとクリックで form が送信される。

dev サーバを立て、Firebase Auth へ実際に出たリクエストの数を Playwright で数えた:

| 操作（修正前） | 結果 |
|---|---|
| サインイン「次へ」を1回押す | 認証リクエストが**2回** |
| サインイン「キャンセル」 | **サインインが走る** |
| サインインでパスワード欄から Enter | **トップへ飛ばされる**（Enter は form 内の最初の submit ボタン＝キャンセルを押したことになる） |
| 新規登録「キャンセル」 | **アカウント作成が走る** |
| パスワード再設定「キャンセル」 | **再設定メールが送られる** |

issue が挙げていたのは1行目だけで、残りはこの調査で見つかった。

## なぜ `button.vue` に `type="button"` を足さないか

それが一番短い直し方に見えるが、**電話番号ログインが止まる**。PhoneLogin の送信ボタン2つは
`@click` を持たず、`t-button` が form 内で既定で submit になることに**依存して動いている**。

`button.vue` の `type` prop は一度足されたあと、専用の `t-submit` を作る形に置き換えて外された。
その型（送信は `t-submit`、それ以外は送信しない）に合わせ、呼び出し側で直す。

## 直し方

- サインイン「次へ」: `<t-button @click="onSignin">` → `<t-submit>`。入口を form の `@submit` だけにする
- 各キャンセル: `type="button"` を明示する（`t-button` は `type` を prop として宣言していないので、
  そのままルートの `<button>` に落ちる）

## PhoneLogin は触らない

同じ不具合の形をしている（キャンセルで form が送信され、SMS 送信処理が走る）。しかし invisible
reCAPTCHA が `id="signInButton"`、つまり**キャンセルボタン**に紐づいている。invisible reCAPTCHA は
紐づけたボタンのクリックを拾うので、type を変えると SMS 認証の挙動が変わりうる。reCAPTCHA 付きの
電話認証は手元で再現できないため、実機で確かめてから別に直す。

## 確認

- **修正前のコードで同じ Playwright スクリプトが落ちること**（4ケース）、修正後に全ケース通ることを確認
- Enter キーでの送信が1回で維持されること
- 同じ種類の不具合を `yarn test` で捕まえるガード（`test/unit/test_formButtons.ts`）。CI に e2e が無いので
  ブラウザ検証は CI で回らない。許す形を列挙し、それ以外を報告する
