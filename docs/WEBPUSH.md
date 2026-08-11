# Web Push (PWA) の設定

店舗運営者の端末へ、管理画面を閉じていても届く通知を送るための構成メモ。
iOS Safari (16.4+ / ホーム画面に追加した PWA) と Android Chrome、デスクトップブラウザに対応。

## 構成

FCM は使わず、標準の Web Push (VAPID) を直接使う。

```
管理画面: 通知設定で ON → pushManager.subscribe() で PushSubscription 取得
          → registerWebPush2 (callable) が admins/{uid}/webPushSubscriptions/{sha256(endpoint)} に保存
注文発生: notifyRestaurant() → オーナー + 担当サブアカウントの購読を集めて web-push で送信
端末:     sw.js の push イベント → showNotification → タップで該当注文画面へ
```

FCM の FID 方式 (`register`/`onRegistered` + `sendEachForMulticast({fids})`) を採らなかった理由は
issue #1781 と `plans/feat-web-push.md` を参照。要点は、`@firebase/functions` の `httpsCallable()` が
毎回内部で `messaging.getToken()` を呼んで FID を送信ターゲットとして無効化するため、
callable を多用する管理画面とは両立しないこと。

## セットアップ手順

### 1. VAPID 鍵ペアを生成する

```bash
cd functions
npx web-push generate-vapid-keys
```

### 2. 公開鍵を config に設定する

`src/config/default/ownplate-dev.ts` / `ownplate-jp.ts` の `webPushVapidPublicKey` に公開鍵を入れる。
firebaseConfig と同じく公開して問題ない値。**空の間は管理画面に Web Push の設定欄が出ない。**

### 3. 秘密鍵を Secret Manager に登録する

```bash
cd functions
firebase functions:secrets:set VAPID_PRIVATE_KEY
```

秘密鍵が未設定でも注文通知そのものは壊れない（送信をスキップして warning を出す）。

### 4. デプロイ

```bash
yarn build                      # ルート。dist に manifest.webmanifest / sw.js が入る
firebase deploy --only hosting,firestore:rules
firebase deploy --only functions:registerWebPush2,functions:unregisterWebPush2,functions:orderCreatedJp2,functions:orderUpdateJp2
```

`notifyRestaurant()` を呼ぶ関数（注文作成・更新まわり）にも `VAPID_PRIVATE_KEY` を渡す必要があるため、
push 用の2関数だけでなく通知経路の関数も再デプロイする。

### 5. 店舗側の操作

1. スマホのブラウザで管理画面を開く
2. iOS のみ: 共有 → 「ホーム画面に追加」→ **追加したアイコンから起動する**（Safari のタブのままでは不可）
3. サインインして注文画面の「通知設定」を開く
4. 「プッシュ通知：オフ」をタップして許可する

## ハマりどころ

### 1. iOS はホーム画面に追加した PWA のみ

iOS Safari のタブでは `window.Notification` 自体が存在しない。管理画面では
`isWebPushSupported()` が false になるので ON/OFF ボタンを出さず、案内文だけを表示している。

### 2. 通知許可はタップ操作が起点でないと出せない

`Notification.requestPermission()` はユーザー操作のハンドラ内から呼ぶ必要がある。
画面表示時に自動で呼ぶと、ダイアログが出ないまま拒否される。

### 3. Service Worker が active になる前に subscribe できない

`pushManager.subscribe()` は active な worker を要求する。登録直後は installing のことがあるので、
`navigator.serviceWorker.ready` を待ってから subscribe する（`src/utils/webPush.ts`）。

### 4. Service Worker のキャッシュ

`public/sw.js` は何もキャッシュしない（`caches` 不使用、fetch はパススルー）。
加えて `firebase.json` で `/sw.js` を `Cache-Control: no-cache` で配信し、更新が反映されない問題を避ける。

### 5. 失効した購読

端末を初期化したりアプリを消すと購読が失効し、送信が 404 / 410 を返す。
`sendWebPush()` はこの2つのステータスを見て購読 doc を自動削除する。

### 6. サインアウト

共有端末で前のアカウント宛の通知が届き続けないよう、`src/components/App.vue` の
`onAuthStateChanged` でサインアウトを検知したら端末側の購読を解除する。
サーバ側に残った登録は、次の送信が 410 を返した時点で削除される。

### 7. macOS / Windows で通知が出ない

`Notification.permission === "granted"` でも、OS 側の通知設定でブラウザが OFF だったり
集中モードだと表示されない。切り分けは開発者コンソールで
`navigator.serviceWorker.ready.then(r => r.showNotification("test", { body: "hi" }))` を直接実行する。

## データ

`admins/{uid}/webPushSubscriptions/{subscriptionId}`

| フィールド | 内容 |
| --- | --- |
| `endpoint` | PushSubscription の endpoint URL |
| `keys.p256dh` / `keys.auth` | 暗号化鍵 |
| `updatedAt` | 登録・更新時刻 |

- `subscriptionId` は endpoint の SHA-256。同じ端末で再購読しても doc が増えない。
- Functions からのみ読み書きする（`firestore.rules` でクライアントからのアクセスを拒否）。

送信結果は `restaurants/{restaurantId}/log/{date}/webPushLog/{orderId}-{messageId}` に記録される。
