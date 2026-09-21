# 店舗運営者向け通知に PWA / Web Push を追加する

> **登録まわりはこのあと差し替えた。** 店舗紐付け＋ワンタイム URL への変更は
> [plans/feat-web-push-invite.md](./feat-web-push-invite.md) を参照。
> この文書は FCM FID 方式そのものの判断（httpsCallable との衝突、専用 app による分離、
> installation の回転、tag を付けない理由）の記録として残す。

関連 issue: https://github.com/Nakajima-Foundation/ownplate/issues/1781
設定・運用手順: [docs/WEBPUSH.md](../docs/WEBPUSH.md)

## 背景・課題

新規注文の店舗向け通知は `functions/src/functions/notify2.ts` の `notifyRestaurant()` に集約され、
LINE / メール(SES) / 電話(Twilio) / `admins/{uid}/private/notification` 経由の通知音 の4経路がある。
通知音は管理画面を開いている間しか鳴らないため、画面を閉じた端末に届く経路が無い。

## 方式: FCM の FID 方式

mulmoserver と同じ構成にする。端末は `register()` / `onRegistered()` で FID を取り、
サーバは firebase-admin の `sendEachForMulticast({ fids, data })` で送る。

当初は標準 Web Push（VAPID + `web-push` パッケージ）で実装した。`httpsCallable()` が内部で
デフォルトアプリの `messaging.getToken()` を呼び、FID をサーバ側で無効化してしまうためで、
callable を多用する管理画面とは両立しないと判断していた。

衝突そのものは実在するが、**push を専用の Firebase app（名前 `"push"`）で扱えば回避できる**。
installation id は `` `${app.name}!${appId}` `` をキーに保存されるので、アプリ名が違えば FID も別物になり、
デフォルトアプリの `getToken()` に巻き込まれない。実機で「callable を叩いた直後の送信も届く」ことを確認したうえで
FID 方式に切り替えた。callable 側には手を入れていない。

FID 方式にした利点:

- iOS / Android / デスクトップの差分を FCM が吸収する
- 秘密鍵の管理が不要（Secret Manager への登録も無い）
- mulmoserver / mulmoterminal と同じ実装なので、詰まったときに参照先がある

前提として firebase-admin 14 への更新が必要で、これは別 PR で先に済ませた。

## データモデル

`admins/{uid}/pushRegistrations/{fid}`

| フィールド | 内容 |
| --- | --- |
| `fid` | Firebase Installation ID（doc id と同じ） |
| `platform` | `ios` / `android` / `other` |
| `updatedAt` | serverTimestamp |

- doc id が FID なので、同一端末の再登録で doc が増殖しない。
- 書き込みは Functions のみ。`firestore.rules` で client の read/write を明示的に拒否する。
- 登録・解除の uid は `request.auth` からしか取らない。

## 送信対象の解決

`notifyRestaurant()` は `restaurants/{restaurantId}` の `uid`(オーナー)を既に読んでいる。

1. オーナー uid
2. `admins/{ownerUid}/children` の各 doc のうち `restaurantLists` に `restaurantId` を含む childUid

children は少数なので全件取得してメモリ上で絞る（複合インデックス不要）。

## 実装

### Functions

- `functions/src/functions/notify/webpush.ts`
  - `sendWebPush(db, uids, data)`: 対象 uid の FID を集めて `sendEachForMulticast` で送信。
    multicast の宛先上限を超える分は分割する。
  - 宛先そのものが無効であることを示すコードを返した FID だけ削除する（prune）。
    `messaging/invalid-argument` は payload 不正でも返るため根拠にしない。
  - 失敗した FCM エラーコードを結果に含める。これが無いと「届かない」以上の切り分けができない。
- `functions/src/functions/notify/webpushFormat.ts`
  - 純関数の payload 生成と送信対象 uid の解決。テスト対象。
  - tag は持たせない（同じ tag の通知は置き換えになり再通知されない）。
- `functions/src/functions/webPush.ts` + `functions/src/wrappers/webPush/*`
  - `registerWebPush2` / `unregisterWebPush2` / `sendTestWebPush2`
    （onCall・asia-northeast1・App Check 強制）。
- `notifyRestaurant()` に1チャネル追加。送信結果は
  `restaurants/{restaurantId}/log/{date}/webPushLog/{orderId}-{messageId}` に既存 lineLog と同形で記録。
  push の失敗が既存チャネルや注文処理を巻き込まないよう try/catch で封じ込める。
- 重複していた `createNotifyRestaurantLineMessage` / `createNotifyRestaurantMailTitle`（内容が完全に同一）を
  `createNotifyRestaurantSubject` に集約し、push の title にも再利用する。

### フロント

- `src/utils/webPush.ts`
  - `pushApp()` — push 専用の Firebase app。`getMessaging()` / `getInstallations()` は必ずこれを渡す。
  - `subscribeThisDevice()` — 許可 → SW 登録 → リセット → `register()` → FID。
  - `resetBeforeRegistering()` — 購読の破棄と installation id の回転を `allSettled` で並列に。
    これが無いと `register()` のキャッシュから成功が返り、FCM 側で死んだ登録に戻れない。
  - `onRegistered` のハンドラは一度張ったら外さない（外すと後続が
    `invalid-on-registered-handler` で落ちる）。
  - `listenForegroundPush()` — 前面ではブラウザが背面ハンドラを呼ばないので自分で表示する。
- `src/utils/pushFormat.ts` / `src/utils/pushReset.ts` — Firebase 非依存の純関数。ブラウザ無しで単体テストできる。
- `src/lib/firebase/functions.ts` に callable を3つ追加。
- `src/app/admin/Notifications/NotificationSettings.vue` に ON/OFF トグルを追加（`useWebPushToggle`）。
  通知許可ダイアログは**タップ起点でないと出せない**ので、トグル押下から `Notification.requestPermission()` を呼ぶ。
- `src/app/admin/WebPush/Index.vue` — `/admin/webpush` の確認用ページ。登録 / 解除 / 送信と、
  FCM の失敗コード・SW の scope / state・通知許可をログに出す。
- サインアウトは `signOutAfterDisablingPush()` に集約し、`signOut()` の**前に**
  `disableThisDevice()` を best-effort で実行する（共有端末で前アカウント宛の通知が届き続けるのを防ぐ。
  認証が切れたあとでは callable が必ず失敗する）。待ちは `settleWithin()` で上限を付け、
  片付けが遅くてもログアウトを止めない。

### PWA

- `public/manifest.webmanifest` — `scope` / `start_url` とも `/admin/`。既存のアイコンを流用。
- manifest と apple 用 meta は `src/app/admin/Wrapper.vue` の `useHead` から差し込む。
  `index.html` に置くと注文者にも PWA 導線が出るため。**`useHead` は `setup()` の中で呼ぶ**
  （モジュール直下だと `injectHead()` が context を見つけられず throw し、管理画面が丸ごと白画面になる）。
- `public/sw.js`: compat SDK を CDN から読み、`onBackgroundMessage` → `showNotification`。
  precache しない。firebaseConfig は登録 URL のクエリで受け取る（環境別に作り分けない）。
  `notificationclick` は `/admin/` で始まるタブだけを再利用対象にする。
- Service Worker の登録は `src/app/admin/Wrapper.vue` から scope `/admin/` で行う。注文者側には一切置かない。
- `firebase.json` の hosting headers に `/sw.js` の `Cache-Control: no-cache` を追加。

### 設定

- Firebase コンソールの Cloud Messaging ウェブ構成の公開鍵を
  `src/config/default/{ownplate-jp,ownplate-dev}.ts` の `webPushVapidPublicKey` に設定する。
- `fcmregistrations.googleapis.com` / `fcm.googleapis.com` を有効化する。
- 公開鍵が空の間は UI 側でトグルを出さず、サーバ側も Firestore を読む前に打ち切る。

## 対象外

- infinity notification（一定間隔での再通知）の push での再現。未対応注文の定期再送は scheduled function が別途必要。
- 注文者（ユーザー側）への Web Push。

## 確認観点

- [x] Android Chrome で登録し、テスト送信が届く
- [x] callable を叩いた直後でもテスト送信が届く（専用 app による分離の確認）
- [x] 連続して送っても2通目以降が届く（tag を外した確認）
- [ ] 実際の注文で `notifyRestaurant()` 経由の通知が届く
- [ ] iOS 16.4+ で「ホーム画面に追加」した PWA から登録でき、閉じた状態で届く
- [ ] 通知タップで該当注文画面に遷移する
- [ ] オーナーとサブアカウントの両方に届く。担当外店舗のサブアカウントには届かない
- [ ] サインアウト後、その端末に前アカウント宛の通知が届かない
- [ ] 登録を持たない店舗でも既存の LINE / メール / 電話 / 通知音 が従来通り動く
- [ ] 注文者のページで Service Worker も manifest も読み込まれない

## テスト

- `functions/tests/webpush_test.ts` — payload 生成・送信対象 uid の解決・分割・prune 対象コード・validator。
  `ci_test` の `wp_tests` から走る。
- `test/unit/test_pushFormat.ts` / `test/unit/test_pushReset.ts` — フロント側の純関数。
  `yarn test`（`node --test`）で走り、CI の `build-vue` に入れてある。依存追加は無し。
- ルート: `yarn format` / `yarn lint` / `yarn build` / `yarn test`。
- functions: `yarn format` / `yarn lint` / `yarn build` / `yarn ci_test`。
