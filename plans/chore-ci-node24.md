# CI の action を Node 24 に揃える

omochikaeri-docs#203

## 何が問題か

main への push で走る deploy の workflow が警告を出していた。

```
Node.js 20 is deprecated. The following actions target Node.js 20 but are being forced to
run on Node.js 24: google-github-actions/auth@v2
```

## 調べた結果

git 管理下の workflow で Node 20 なのは `google-github-actions/auth@v2` **1つだけ**。
`actions/checkout@v6` / `actions/setup-node@v6` / `actions/cache@v5` /
`github/codeql-action/*@v3` はすべて node24。Node そのものも既に24に揃っている。

## v3 に上げる根拠

`google-github-actions/auth@v3` は `runs.using: node24`。v3.0.0 の変更は
「Node 24 へ更新し、古いパラメータを削除」で、消えたのは `backoff` / `backoff_limit` /
`retries` の3つ。この workflow は使っていない。

渡している `workload_identity_provider` / `service_account` / `create_credentials_file` は
v3 の入力にもすべて残っていることを、v2 と v3 の `action.yml` を突き合わせて確認した。

## 確かめられないこと

この workflow は **main への push でしか走らない**（staging へデプロイする）。PR の CI では
一度も動かないので、実際の認証が通るかはマージ後の1回目で分かる。入力の突き合わせまでが
事前にできる限界。
