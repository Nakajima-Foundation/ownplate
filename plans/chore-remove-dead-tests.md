# functions: 動かないテストファイルとスクリプトを削除する

omochikaeri-docs#192

## 根拠

8本すべてを実際に読み込ませて確かめた（静的な確認だけにしない）:

```
NODE_ENV=test node --import tsx -e "import('./tests/<名前>.ts')"
```

8本とも `Cannot find module 'chai'` で止まる。`mocha` も `chai` も `functions/package.json` の
依存に無く、`node_modules` にも無い。

そのうえで6本は、import 先のモジュールが今は存在しない:

| ファイル               | 消えている import                          |
| ---------------------- | ------------------------------------------ |
| `order_test.ts`        | `src/functions/order`, `src/stripe/intent` |
| `order_change_test.ts` | 同上                                       |
| `notify_test.ts`       | `src/functions/notify`                     |
| `ses_test.ts`          | `src/functions/ses`                        |
| `sms_test.ts`          | `src/functions/sms`                        |
| `twilio_test.ts`       | `src/functions/twilio`                     |

依存を入れても動かない。書き直しが要る。

## やること

1. 上の6本を削除する。git の履歴に残るので、書き直すときは参照できる
2. 削除した6本を指すスクリプトを消す（`o_tests` / `oc_tests` / `n_tests` / `t_tests` / `mailtests`）
3. 元から存在しないファイルを指すスクリプトを消す（`t2_tests` / `s_tests` / `smaregitests` / `d_tests`）
4. `tests` （`mocha --recursive tests/*_test.ts`）を消す。残るファイルには `node:test` で書かれた
   `admin_smoke_test.ts` が含まれるので、mocha で一括して走らせる形が成り立たない
5. `functions/tests/README.md` を置き、何が走って何が走らないかを書く

## 残すもの

- `express_test.ts` / `stripe_test.ts` — import は解決する。`mocha` と `chai` を入れて Firestore
  emulator を起動すれば動く見込み。`e_tests` のスクリプトも残す
- `admin_smoke_test.ts` と `smoke_tests` — `node:test` で書かれており、emulator があれば動く

## 確かめ方

削除の前後で `yarn ci_test` のテスト数が変わらないこと。`package.json` の全スクリプトが、
存在するファイルを指していること。
