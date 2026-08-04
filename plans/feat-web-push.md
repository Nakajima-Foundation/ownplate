# 店舗運営者向け通知に PWA / Web Push を追加する

関連 issue: https://github.com/Nakajima-Foundation/ownplate/issues/1781

## 背景・課題

新規注文の店舗向け通知は `functions/src/functions/notify2.ts` の `notifyRestaurant()` に集約され、
LINE / メール(SES) / 電話(Twilio) / `admins/{uid}/private/notification` 経由の通知音 の4経路がある。
通知音は管理画面を開いている間しか鳴らないため、画面を閉じた端末に届く経路が無い。

## 方式: 標準 Web Push (VAPID + `web-push`)

FCM を使わず、W3C Push API + VAPID で直接ブラウザの push サービスへ送る。判断根拠は issue #1781 に記載。
要点は、`httpsCallable()` が内部で `messaging.getToken()` を呼ぶため FCM の FID 方式が
callable 23個と両立しないこと、および `getToken` 方式は非推奨 API であること。

- firebase-admin の更新は不要（現行 13.8.0 のまま）
- App Check(`enforceAppCheck = true`) を迂回する必要が無く、登録/解除は通常の callable で行える

## データモデル

`admins/{uid}/webPushSubscriptions/{subscriptionId}`

| フィールド | 内容 |
| --- | --- |
| `endpoint` | PushSubscription の endpoint URL |
| `keys.p256dh` / `keys.auth` | 暗号化鍵 |
| `updatedAt` | serverTimestamp |

- `subscriptionId` は endpoint の SHA-256。同一端末の再購読で doc が増殖しない。
- 書き込みは Functions のみ。Firestore rules で client の read/write を明示的に拒否する
  （`match /admins/{userId}` は subcollection に波及しないので現状でも拒否されるが、明示する）。

## 送信対象の解決

`notifyRestaurant()` は `restaurants/{restaurantId}` の `uid`(オーナー)を既に読んでいる。

1. オーナー uid
2. `admins/{ownerUid}/children` の各 doc のうち `restaurantLists` に `restaurantId` を含む childUid

children は少数なので全件取得してメモリ上で絞る（複合インデックス不要）。

## 実装

### Functions

- `functions/src/functions/notify/webpush.ts`
  - `sendWebPush(db, uids, payload)`: 対象 uid の購読を集めて `web-push` で送信。
    404 / 410 は購読失効なので該当 doc を削除する（prune）。
  - VAPID: 公開鍵は `functions/src/common/project.ts`（`src/config/project.ts` からのコピー）、
    秘密鍵は `defineSecret("VAPID_PRIVATE_KEY")`、subject は `https://${ownPlateConfig.hostName}`。
- `functions/src/functions/notify/webpushFormat.ts`
  - 純関数の payload 生成（title / body / url / tag）。テスト対象。
- `functions/src/functions/webPush.ts` + `functions/src/wrappers/webPush/*`
  - `registerWebPush2` / `unregisterWebPush2`（onCall・asia-northeast1・App Check 強制）。
- `notifyRestaurant()` に1チャネル追加。送信結果は
  `restaurants/{restaurantId}/log/{date}/webPushLog/{orderId}-{messageId}` に既存 lineLog と同形で記録。
  push の失敗が既存チャネルや注文処理を巻き込まないよう try/catch で封じ込める。
- 重複していた `createNotifyRestaurantLineMessage` / `createNotifyRestaurantMailTitle`（内容が完全に同一）を
  `createNotifyRestaurantSubject` に集約し、push の title にも再利用する。

### フロント

- `src/utils/webPush.ts`
  - `isWebPushSupported()` / `subscribeWebPush()` / `unsubscribeWebPush()` /
    `urlBase64ToUint8Array()`（applicationServerKey 変換）。
- `src/lib/firebase/functions.ts` に callable を2つ追加。
- `src/app/admin/Notifications/NotificationSettings.vue` に ON/OFF トグルを追加。
  通知許可ダイアログは**タップ起点でないと出せない**ため、トグル押下から `Notification.requestPermission()` を呼ぶ。
- Service Worker 登録は `src/main.ts`。
- サインアウト時に `unsubscribeWebPush()` を best-effort で実行（共有端末で前アカウント宛の通知が届き続けるのを防ぐ）。

### PWA

- `public/manifest.webmanifest`（サイト全体・既存の `android-chrome-192x192.png` / `512x512.png` を流用）
- `public/sw.js`: precache しない。`push` → `showNotification`、`notificationclick` → 既存タブを focus、
  無ければ `/admin/restaurants/{restaurantId}/orders/{orderId}` を開く。
- `index.html` に manifest / apple 用 meta を追加。
- `firebase.json` の hosting headers に `/sw.js` の `Cache-Control: no-cache` を追加。

### 設定

- VAPID 鍵ペアを生成し、公開鍵を `src/config/default/{ownplate,ownplate-jp,ownplate-dev}.ts` に、
  秘密鍵を `firebase functions:secrets:set VAPID_PRIVATE_KEY` に設定する。
- 公開鍵が未設定の間は UI 側でトグルを無効化する。

## 対象外

- infinity notification（60秒ごとの再通知）の push での再現。未対応注文の定期再送は scheduled function が別途必要。
- 注文者（ユーザー側）への Web Push。

## 確認観点

- iOS 16.4+ で「ホーム画面に追加」した PWA から購読でき、アプリを閉じた状態で通知が届く。
- Android Chrome で同様に届く。
- 通知タップで該当注文画面に遷移する。
- オーナーとサブアカウントの両方に届く。担当外店舗のサブアカウントには届かない。
- サインアウト後、その端末に前アカウント宛の通知が届かない。
- 購読を持たない店舗でも既存の LINE / メール / 電話 / 通知音 が従来通り動く。

## テスト

- `functions/tests/` に payload 生成と送信対象 uid 解決の単体テストを追加。
- ルート: `yarn format` / `yarn lint` / `yarn build`。
- functions: `yarn format` / `yarn lint` / `yarn build` / 既存 `yarn tests`。
