
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
