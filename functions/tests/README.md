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
| `express_test.ts` | `yarn e_tests` | **走らない。** `mocha` / `chai` / `cheerio` が依存に入っていない（`cheerio` は `test_helper.ts` が使う） |
| `stripe_test.ts` | — | **走らない。** `mocha` / `chai` が依存に入っていない。走らせるスクリプトも無い |

足りない依存は、実際に読み込ませれば1つずつ出る:

```
NODE_ENV=test node --import tsx -e "import('./tests/express_test.ts')"
```

import 先のモジュールはどちらも今も解決するので、依存を足せば動く見込み。

## 消したもの

`order_test.ts` / `order_change_test.ts` / `notify_test.ts` / `ses_test.ts` / `sms_test.ts` /
`twilio_test.ts` は、import 先のモジュールが今は存在せず、依存を足しても動かない状態だった。
書き直すときは git の履歴から取れる。
