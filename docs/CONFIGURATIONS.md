# Firebase Functions

- stripe.secret_key - Stripe secret key
- locale.region - region. US, JP, EU
- aws.id - AWS id for sms push
- aws.secret - AWS secret for sms push
- senty.dsn - SENTY endpoint for Functions ( client dsn set src/config/project.js )
- line.secret - LINE secret for the Login channel
- line.message_token - LINE access token (long-lived) for the Message API channel

# Environment variables for build client

- STRIPE_API_KEY - Stripe public key
- STRIPE_CLIENT_ID - Stripe oauth client id
- GAPIKey - Google map api key
- REGION - ~~Region. US, JP, EU~~ Not support now. Moved to project.js
- LOCALE - ~~vue i18n locale (us, ja, eu)~~ Not support now. vue i18n locale is set by REGION. 

# Firebase web client (Vue.js) configurations
- src/config/project.js - configuration file.

# LIFF

- LINE Developersにログイン

- LINEログインチャンネルを作成
  - アプリタイプ 
    - ウェブアプリ
- Messageチャンネルを作成(公式アカウントを作成済みの場合は、それに対応したMessageチャンネルが存在するので、それを使う)
- Messageチャンネル設定
  - Message API設定
    - チャネルアクセストークン(長期)を作成
      - チャネルアクセストークンをおもちかえりに設定

- LINEログインチャンネルの設定
  - 上記Messageチャンネルと、ボットとリンク
  - LIFF 追加
    - サイズ
      - full
    - エンドポイントURL 
      - https://omochikaeri.com/liff/{$liffindexId} <- ここのurlはおもちかえり管理者に確認
    - Scope
      - profile, openid の両方にcheck
    - ボットリンク機能 
      - On (Aggressive)
  - ログインチャンネルを公開に切り替える

- おもちかえり側で必要な設定
  - liff/{liffindexId}
    - cliendId 
      - LINE ログインチャンネルのチャンネルID
    - liffId
      - LINE ログインチャンネル -> Liff -> LIFF ID
    - friendUrl
      - メッセージチャンネル -> LINE Official Account Manager -> 友だち追加ガイド -> URLを作成
    - restaurants
      - [restaurant id] 
        - liff内で使うお店。おもちかえりのurlを元に。
  - liff/{liffindexId}/liffPrivate/data
    - message_token
      - LINEメッセージチャンネル -> Messaging API設定 -> チャネルアクセストークン（長期）

# Storage CORS

PDF印刷用にcloud storageのCORSを設定する必要がある。

## Google Cloud Shell を開く

https://console.cloud.google.com/home/dashboard?project=ownplate-dev&cloudshell=true&hl=ja

## 設定ファイルを作る
vi a.json
[
  {
    "origin": ["http://localhost:3000", "https://staging.ownplate.today"],
    "method": ["GET"],
    "maxAgeSeconds": 3600
  }
]

[
  {
    "origin": ["http://localhost:3000", "https://omochikaeri.com"],
    "method": ["GET"],
    "maxAgeSeconds": 3600
  }
]

## デプロイ

```
gsutil cors set a.json gs://ownplate-dev.appspot.com
```

