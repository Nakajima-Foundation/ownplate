# Web Push (PWA) の設定

店舗運営者の端末へ、管理画面を閉じていても届く通知を送るための構成メモ。
iOS Safari（ホーム画面に追加した PWA）と Android Chrome、デスクトップブラウザに対応。

## 構成

FCM（Firebase Cloud Messaging）の **FID 方式** を使う。端末は FCM の
`register()` / `onRegistered()` で Firebase Installation ID（FID）を取得し、
サーバは `sendEachForMulticast({ fids, data })` でその FID 宛に送る。
VAPID 公開鍵は FCM の Web 設定として使う（`web-push` パッケージは使わない）。

```
管理画面: 通知設定で ON → register() → onRegistered() で FID 取得
          → registerWebPush2 (callable) が admins/{uid}/pushRegistrations/{fid} に保存
注文発生: notifyRestaurant() → オーナー + 担当サブアカウントの FID を集めて
          sendEachForMulticast({ fids, data }) で送信
端末:     sw.js の onBackgroundMessage → showNotification → タップで該当注文画面へ
```

送信は **data のみ**（`notification` ブロックを付けない）。付けると SDK が独自に通知を出し、
表示が二重になりタップの制御も奪われる。表示は `public/sw.js`（背面）と
`listenForegroundPush()`（前面）が組み立てる。

### httpsCallable と FID の衝突を、専用 Firebase app で避けている

`@firebase/functions` の `httpsCallable()` は呼び出しのたびに**デフォルトアプリの**
`messaging.getToken()` を実行し、legacy 登録を作って FID を送信先として無効化する
（クライアント側からは見えず、送信して初めて `messaging/installation-id-not-registered` で分かる）。
管理画面は callable を多用するので、そのままでは登録が次々死ぬ。

installation id は `` `${app.name}!${appId}` `` をキーに保存される。そこで push だけを
`"push"` という名前の別アプリ（`src/utils/webPush.ts` の `pushApp()`）で扱い、
デフォルトアプリの `getToken()` に巻き込まれないようにしている。
実機で「callable を叩いた直後でも送信が届く」ことを確認済み。

前提: **`src/utils/webPush.ts` は `getMessaging()` / `getInstallations()` を必ず `pushApp()` 付きで呼ぶ。**
一箇所でもデフォルトアプリを渡すとこの分離が崩れ、症状は「しばらく動いていたのに突然届かなくなる」形で出る。

## セットアップ手順

### 1. Firebase プロジェクト側で API を有効化する

```bash
gcloud services enable fcmregistrations.googleapis.com --project <project-id>
gcloud services enable fcm.googleapis.com --project <project-id>
```

`fcmregistrations.googleapis.com` が無効だと `register()` が失敗する。

### 2. VAPID 公開鍵を config に設定する

Firebase コンソール → プロジェクトの設定 → Cloud Messaging → ウェブ構成 の鍵ペアを使う。
公開鍵を `src/config/default/ownplate-dev.ts` / `ownplate-jp.ts` の `webPushVapidPublicKey` に入れる。
firebaseConfig と同じく公開して問題ない値。**空の間は Web Push が丸ごと無効**（管理画面に設定欄が出ず、
サーバ側も Firestore を読む前に打ち切る）。

秘密鍵は不要。送信は firebase-admin の認証で行うので Secret Manager への登録も無い。

### 3. デプロイ

```bash
yarn build                      # ルート
firebase deploy --only hosting,firestore:rules
cd functions && yarn deploy
```

`sw.js` と `manifest.webmanifest` は `public/` の静的ファイルなので hosting に含まれる。

### 4. 店舗側の操作

1. スマホのブラウザで管理画面を開く
2. iOS のみ: 共有 → 「ホーム画面に追加」→ **追加したアイコンから起動する**（Safari のタブのままでは不可）
3. サインインして注文画面の「通知設定」を開く
4. 「プッシュ通知：オフ」をタップして許可する

### 5. 動作確認

`/admin/webpush` に確認用ページがある。登録 / 解除 / テスト送信と、
FCM の失敗コード・Service Worker の scope / state・通知許可の状態がログに出る。
宛先はサインイン中の uid の登録端末だけで、他のアカウントには届かない。

## ハマりどころ

### 1. iOS はホーム画面に追加した PWA のみ

iOS Safari のタブでは `window.Notification` 自体が存在しない。管理画面では
`isWebPushSupported()` が false になるので ON/OFF ボタンを出さず、案内文だけを表示している。

### 2. 通知許可はタップ操作が起点でないと出せない

`Notification.requestPermission()` はユーザー操作のハンドラ内から呼ぶ必要がある。
`isSupported()` は IndexedDB を開いてクリックの transient activation を使い切るので、
**permission を先に取ってから** `isSupported()` を待つ（`checkPreconditions()`）。

### 3. 登録の前に installation id を回す

`register()` は自前のキャッシュから成功を返す（保存済み FID が一致し更新期限内なら FCM に問い合わせない）。
FCM 側で既に落とされた登録はここから見えず、送信して初めて分かる。そのときサーバは prune 済みなので、
押し直しても同じキャッシュに当たり、端末は何日も登録できないままになる（mulmoserver#148）。

`unregister()` / `deleteToken()` では直せない。どちらもサーバ側の削除を先に行い、
落ちた登録が返す 404 で throw してローカルの掃除まで到達しないため。
そこで登録前に **購読の破棄と installation id の回転** を両方走らせる（`resetBeforeRegistering()`）。
2つは独立していて、直列に繋ぐと片方の失敗でもう片方がスキップされるので `allSettled` で並べる。

### 4. onRegistered のハンドラは外さない

SDK の `register()` は通知を送った**あと**にもハンドラの存在を確認し、installation id が変わると
SDK 自身が `register()` をもう一本キューに積む。FID を受け取った時点で解除すると後続が
`messaging/invalid-on-registered-handler` で落ちる。ハンドラは一度張ったまま、
待ち受けリスト（`fidWaiters`）側で解決する。

### 5. payload に tag を付けない

同じ tag の通知は既存を置き換えるだけで、`renotify` が無い限り再通知されない。
実機で「1通目だけ出て以降沈黙する」状態になったため、SW・前面ハンドラ・payload のいずれにも tag は持たせない。

### 6. Service Worker のキャッシュと scope

`public/sw.js` は何もキャッシュしない（`caches` 不使用、`fetch` ハンドラは `respondWith` を呼ばない空実装。
Chrome がインストール導線を出す条件を満たすためだけに置いてある）。
加えて `firebase.json` で `/sw.js` を `Cache-Control: no-cache` で配信する。

登録時の scope は `/admin/`。注文者が開くページは Service Worker の管理下に入らない。
firebaseConfig は環境ごとに違うため、登録 URL のクエリで SW に渡す（`sw.js` を環境別に作らずに済む）。

### 7. 通知タップ時のタブ選択

`clients.matchAll({ includeUncontrolled: true })` は scope の外にある同一オリジンのページ
（注文者が開いている店舗ページなど）も返す。絞らないと注文者のタブを管理画面へ飛ばしてしまうので、
URL が `/admin/` で始まるものだけを再利用対象にする。

### 8. サインアウト

共有端末で前のアカウント宛の通知が届き続けないよう、**サインアウトする前に**配信先から端末を外す。
`unregisterWebPush` は `request.auth` から uid を取るので、認証が切れたあとでは必ず失敗する。

サインアウトは `signOutAfterDisablingPush()`（`src/utils/useWebPushToggle.ts`）に集約してある。
新しいサインアウト経路を足すときはここを通すこと。待ちには上限があり、
外せなくてもサインアウトは必ず行う（サーバ側は次の送信が「宛先が無効」を返した時点で登録を消す）。

### 9. macOS / Windows で通知が出ない

`Notification.permission === "granted"` でも、OS 側の通知設定でブラウザが OFF だったり
集中モードだと表示されない。切り分けは開発者コンソールで
`navigator.serviceWorker.ready.then(r => r.showNotification("test", { body: "hi" }))` を直接実行する。

## データ

`admins/{uid}/pushRegistrations/{fid}`

| フィールド | 内容 |
| --- | --- |
| `fid` | Firebase Installation ID（doc id と同じ） |
| `platform` | `ios` / `android` / `other` |
| `updatedAt` | 登録・更新時刻 |

- doc id が FID なので、同じ端末で再登録しても doc が増えない。
- Functions からのみ読み書きする（`firestore.rules` でクライアントからのアクセスを拒否）。
- 登録・解除の uid は `request.auth` からしか取らない。他人のアカウントに端末を紐づけることはできない。
- 送信が「宛先そのものが無効」を示すコードを返した FID だけを削除する。
  `messaging/invalid-argument` は payload 不正でも返るため、削除の根拠にしない。

送信結果は `restaurants/{restaurantId}/log/{date}/webPushLog/{orderId}-{messageId}` に記録される。
