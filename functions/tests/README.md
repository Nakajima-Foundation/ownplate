# functions のテスト

## CI で走るもの — `tests/unit/`

```
yarn ci_test
```

外部サービスも Firestore emulator も要らない、純粋な関数のテスト。`node:test` で書く。
`tests/unit/` に `*_test.ts` を置けば、`package.json` を直さなくても CI で走る。

## 手元でだけ走るもの — Firestore emulator が要る

先に emulator を起動する:

```
firebase emulators:start --only firestore --project firestore-emulator-ownplate
```

| ファイル | 走らせ方 | 状態 |
| --- | --- | --- |
| `admin_smoke_test.ts` | `yarn smoke_tests` | `node:test`。emulator があれば走る |
| `express_test.ts` | `yarn e_tests` | **`mocha` と `chai` が依存に入っていないので、いまは走らない** |
| `stripe_test.ts` | — | 同上。走らせるスクリプトも無い |

`express_test.ts` と `stripe_test.ts` を走らせるには `mocha` / `chai` / `chai-string` を
devDependencies に足す必要がある。import 先は今も解決するので、依存を入れれば動く見込み。

## 消したもの

`order_test.ts` / `order_change_test.ts` / `notify_test.ts` / `ses_test.ts` / `sms_test.ts` /
`twilio_test.ts` は、import 先のモジュールが今は存在せず、依存を足しても動かない状態だった。
書き直すときは git の履歴から取れる。
