
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


