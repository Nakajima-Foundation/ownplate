# nakajima-demae

> My grand Nuxt.js project

## Build Setup

```bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start

# generate static project
$ npm run generate

# "devsync": "HOST=192.168.100.20 PORT=3333 nuxt",
# ローカル環境（PC）を自分のスマホで確認したい場合、同じネットワークに接続してHOST={IPアドレス}を指定してあげれば、スマホからも確認できます
$ npm run devsync
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).

## ESlint + Prettier

Saveと同時にフォーマッターが動くように設定しています（.eslintrc.js）。
VSCodeを使用して、すでにPrettierを使っている場合競合して、うまく保存できない場合があります。

その場合VSCode側にPrettierをオフにする必要があります。

* ① VSCodeの左下の歯車を押す
* ② 設定を押す
* ③ 右上の右から三番目の「設定（JSON）を開く」を押す
* ④ 以下の設定がある場合は確認する（なければOK！）

"[vue]": {
  "editor.formatOnSave": false // ここがtrueになっている場合はfalseにする
},

※ 設定がない場合は無視してOK。trueになっている場合のみfalseに変更する
