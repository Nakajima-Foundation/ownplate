# おもちかえり.com と 飲食店様 LINE公式アカウント の連携方法 <!-- omit in toc -->

2023/9/26 の更新により、飲食店様のLINE公式アカウントからお客様に対して、注文の受理・注文の準備完了・キャンセルなどの通知ができるようになりました。(注意: LINE公式アカウントのメッセージ通数にカウントされます。参考URL LINE公式アカウント料金プラン https://www.lycbiz.com/jp/service/line-official-account/plan/ )

<img src="./images/line_users_screen_line_official_account.png" width="250px">

この記事ではLINE公式アカウントをもっている飲食店様向けに設定方法を説明します。

- [1. 飲食店様側の設定](#1-飲食店様側の設定)
	- [1.1. LINE 公式アカウントの管理画面 での設定](#11-line-公式アカウントの管理画面-での設定)
	- [1.2. LINE Developers での設定](#12-line-developers-での設定)
		- [1.2.1. 新規チャネル作成](#121-新規チャネル作成)
		- [1.2.2. チャネル設定](#122-チャネル設定)
			- [1.2.2.1. チャネル基本設定](#1221-チャネル基本設定)
			- [1.2.2.2. おもちかえり.com 管理画面](#1222-おもちかえりcom-管理画面)
			- [1.2.2.3. LINEログイン設定](#1223-lineログイン設定)
	- [1.3. LINE Developers から おもちかえり.com 管理画面 へ転記](#13-line-developers-から-おもちかえりcom-管理画面-へ転記)
		- [1.3.1. LINE Developers 側の準備](#131-line-developers-側の準備)
		- [1.3.2. おもちかえり.com 側の準備](#132-おもちかえりcom-側の準備)
		- [1.3.3. チャネルID / チャネルシークレット の転記](#133-チャネルid--チャネルシークレット-の転記)
		- [1.3.4. LINE Messaging API](#134-line-messaging-api)
	- [LINE Developers での設定その2](#line-developers-での設定その2)
- [2. お客様側の設定](#2-お客様側の設定)
	- [2.1. 初期設定時の注意点](#21-初期設定時の注意点)
	- [2.2. 注文完了画面](#22-注文完了画面)
	- [2.3. LINE](#23-line)

# 1. 飲食店様側の設定
## 1.1. LINE 公式アカウントの管理画面 での設定
- LINE 公式アカウントの管理画面にログインします。
- `設定` を押します。  
	![](./images/line_official_account_setting.png)
- `Messaging API` を押します。  
	![](./images/line_official_account_setting_messagingapi.png)
- `Messaging API を利用する` ボタンを押します。  
	![](./images/line_official_account_setting_messagingapi_button.png)
- プロバイダー名（飲食店名など）を入力し、`同意する` ボタンを押します。  
	> 参考: お客様画面の赤枠部分に表示されます。  
	> <img src="./images/line_users_screen_provider.png" width="250px">

	既存のプロバイダーを利用する場合は、該当するプロバイダーを選択してください。  
	![](./images/line_official_account_setting_messagingapi_button_provider.png)
- プライバシーポリシーと利用規約のURLを入力して、`OK` ボタンを押します。任意なので空欄でも大丈夫です。  
	![](./images/line_official_account_setting_messagingapi_button_privacy.png)
- 最終確認をして、`OK` ボタンを押します。  
	![](./images/line_official_account_setting_messagingapi_button_confirm.png)

## 1.2. LINE Developers での設定
### 1.2.1. 新規チャネル作成
LINE公式アカウントとは別に、LINE Developers というサイトがあります。ここでは LINE Developers 上での設定方法について説明します。  

- LINE Developers にログインします。  
	URL: https://account.line.biz/login?redirectUri=https%3A%2F%2Fdevelopers.line.biz%2Fconsole%2F
- ログインするとコンソール画面が表示されます。  
- 項番1.1 で作成したプロバイダー名を選択します。  
	![](./images/line_developers_console.png)
- 項番1.1 で設定したLINE公式アカウント名が表示されていることを確認します。  
	![](./images/line_developers_console_channel.png)
- `新規チャネル作成` ボタンを押します。  
	![](./images/line_developers_console_new_channel.png)
- `新規チャネル作成` に必要な情報を入力します。
  - **チャネルの種類**:	LINEログイン
  - **プロバイダー**:	今回作成したもの
  - **サービスを提供する地域**:	日本
  - 会社・事業者の所在国・地域:	飲食店様の情報を選択
  - チャネルアイコン:	任意。飲食店様の情報を登録します。
  - **チャネル名**:	入力必須。飲食店様の情報を登録します。
  - **チャネル説明**:	入力必須。飲食店様の情報を登録します。
  - **アプリタイプ**:	ウェブアプリにチェックを入れます。
  - 2要素認証の必須化:	任意
  - **メールアドレス**: 飲食店様の情報を登録します。
  - プライバシーポリシーURL: 任意。飲食店様の情報を登録します。
  - サービス利用規約URL: 任意。飲食店様の情報を入力を登録します。
  - LINE開発者契約の内容に同意します: 内容を確認の上、チェックします。

	> 参考: お客様にはこのように表示されます。  
	> チャネルアイコン:	紫枠  
	> チャネル名:	赤枠  
	> チャネル説明:	青枠  
	> <img src="./images/line_users_screen_name_image_etc.png" width="250px">


　上記入力後に `作成` ボタンを押します。
	![](./images/line_developers_console_new_channel_form.png)

### 1.2.2. チャネル設定
#### 1.2.2.1. チャネル基本設定
- 項番2.1 の設定が完了すると以下の画面が表示されます。  
	![](./images/line_developers_console_line_login.png)
- このページの下段の `友だち追加オプション` の項目の`編集`ボタンを押します。  
	![](./images/line_developers_console_line_login_add_friend_option.png)
- 飲食店様のLINE公式アカウントを選択して、`更新` ボタンを押します。  
	![](./images/line_developers_console_line_login_add_friend_option_select.png)

- ここで一度、おもちかえり.com 管理画面を`別タブ`または`別ウインドウ`で開きます。

#### 1.2.2.2. おもちかえり.com 管理画面
- おもちかえり.com の管理画面の店舗情報より `LINE連携` ボタンを押します  
	![](./images/omochikaeri_admin_restaurant_info.png)
- `LINEログイン:コールバックURL` をコピーします  
	![](./images/omochikaeri_admin_restaurant_info_callback.png)
- 先ほどの `LINE Developers > プロバイダー名 > チャネル名(LINEログイン)` に戻ります。

#### 1.2.2.3. LINEログイン設定
- `LINEログイン設定` を選択します。  
	![](./images/line_developers_console_line_login_line-login-setting.png)
- `コールバックURL` の `編集` ボタンを押します。  
	![](./images/line_developers_console_line_login_line-login-callback.png)
- 先ほどおもちかえり.com 管理画面でコピーした `コールバックURL` をペーストして、`更新` ボタンを押します。  
	![](./images/line_developers_console_line_login_line-login-callback2.png)
- LINE Developers 側の設定はこれで一旦終了です。  
	次は LINE Developers の情報をコピーして、おもちかえり.com の管理画面へペーストする作業です。

## 1.3. LINE Developers から おもちかえり.com 管理画面 へ転記
### 1.3.1. LINE Developers 側の準備
- これまでに利用していた `LINE Developers > プロバイダー名 > チャネル名(LINEログイン)` の `チャネル基本設定` を選択します。  

	![](./images/line_developers_console_line_login_basics.png)

### 1.3.2. おもちかえり.com 側の準備
- 項番2.2.2 と同様に `管理画面 > 店舗情報 > LINE連携` にします。  
	![](./images/line_developers_console_line_login_line-login-setting.png)

### 1.3.3. チャネルID / チャネルシークレット の転記
LINE Developers 側のチャネル名(LINEログイン)の

  - 上段: チャンネルID
  - 下段: チャネルシークレット  

を、おもちかえり.com へコピー & ペーストします。  
![](./images/line_developers_to_omochikaeri_line_login.png)

- 次は LINE Developers側の作業です。

### 1.3.4. LINE Messaging API 
- 今回作成した `Provider 名` を選択します。  
	![](./images/line_developers_console_select_provider.png)

- `LINE公式アカウント名 (Messaging API)` を選択します。  
	![](./images/line_developers_console_select_line-official-account.png)

- `Messaging API設定` を選択します。  
	![](./images/line_developers_console_messaging-api-setting.png)

- `チャネルアクセストークン(長期)` の `発行` ボタンを押します。  
	![](./images/line_developers_console_messaging-api-access-token.png)

- `チャネルアクセストークン（長期）`を、おもちかえり.com へコピー & ペーストします。その後、`有効にする` にチェックを入れて `保存` ボタンを押します。  
	![](./images/line_developers_to_omochikaeri_messaging-api.png)

## LINE Developers での設定その2
最後に今回作成した LINE ログインを公開して飲食店様側の設定は終了です。

- 今回作成した `Provider 名` を選択します。  
	![](./images/line_developers_console_select_provider.png)

- 今回作成した `LIEN ログイン名` を選択します。  
	![](./images/line_developers_console_channel2.png)

- `開発中` ボタンを押します。  
	![](./images/line_developers_console_line_login_development.png)

- `公開` ボタンを押します。  
	![](./images/line_developers_console_publish.png)

- 先ほど `開発中` となっていた箇所が `公開済み` になります。
	![](./images/line_developers_console_published.png)

- 以上で、飲食店様側の設定は完了です。

# 2. お客様側の設定
## 2.1. 初期設定時の注意点
お客様にはこの作業を一度だけ実施していただければ大丈夫です。
注意点としては、設定時のブラウザの種類、モードは以下で実施してください。

- iPhone ユーザー
  - Safari ブラウザを利用してください
  - 通常モード（プライベートモードを利用しない）を利用してください
- Android ユーザー
  - Chrome ブラウザを利用してください
  - 通常モード（プライベートモードを利用しない）を利用してください

## 2.2. 注文完了画面
注文完了後の画面上部の `お店LINEから通知を受け取り` をタップします。

<img src="./images/line_users_screen_order.png" width="250px">

## 2.3. LINE
上記を実行すると LINE アプリへ遷移します。遷移後、`許可する` ボタンをタップします。  
以上でお客様側の設定は完了です。

<img src="./images/line_users_screen_authentication.png" width="250px">
