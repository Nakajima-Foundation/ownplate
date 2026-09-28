# 動きを変えずに消せる eslint-disable を消す

## やること

- `no-empty-function`（注文一覧の `order_detacher` の初期値、アップロードの進み具合の callback）: `() => {}` を `() => undefined` にする。どちらも `undefined` を返すだけの関数。
- `no-new`（お客様情報の地図の印）: `new X(...)` の文を `void new X(...)` にする。印を作るという評価そのものは同じ。
- `shims-tsx.d.ts`: 使われていない JSX の型宣言（空の interface 2つと `any`）を消す。このリポジトリに `.tsx` は無い。`Window` の宣言は残す。

## 確かめたこと

- `main` とこのブランチで `yarn build` し、中身のハッシュを除いて比べた。
  - 違うのは `OrderListPage` と `storage` の `()=>{}` が `()=>void 0` になる所だけ。
  - `CustomerInfo` は同じ（`void` は縮めるときに消える）。
- `typecheck` / `typecheck:vue` / `typecheck:test` / `lint` / `test`

## やらないこと

- メニュー一覧の並べ替え（`MenuListPage.vue`）の `no-useless-assignment`: `let tmp = null;` の初期値を外すと、宣言時の初期化を求める `init-declarations` に当たる。消すには do-while の組み方を変える必要がある。
- Stripe のカード入力欄の `any`: 呼ぶときの `this` が reactive proxy から元のオブジェクトに変わる。
- PDF の `as any`: 注文とメニューの PDF で、pdfmake の型に無い `border` / `width` を渡している。
