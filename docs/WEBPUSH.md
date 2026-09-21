# Web Push (PWA) の設定

店舗運営者の端末へ、管理画面を閉じていても届く通知を送るための構成メモ。
iOS Safari（ホーム画面に追加した PWA）と Android Chrome、デスクトップブラウザに対応。

## 構成

FCM（Firebase Cloud Messaging）の **FID 方式** を使う。端末は FCM の
`register()` / `onRegistered()` で Firebase Installation ID（FID）を取得し、
サーバは `sendEachForMulticast({ fids, data })` でその FID 宛に送る。
VAPID 公開鍵は FCM の Web 設定として使う（`web-push` パッケージは使わない）。

登録は LINE と同じく**店舗に紐づく**。通知を受ける端末は管理アカウントの持ち主とは限らない
（厨房のタブレット、アルバイトのスマホ）ので、その端末にログイン情報を渡さずに済むよう、
**ワンタイム URL** 経由でだけ登録できる。

```
管理者:   店舗の「通知端末」画面 → 端末を追加 → createPushInvite2 が URL を返す
          （QR とコピーで端末に渡す）
登録端末: その URL を開く（ログイン不要）→ 名前を入れて通知を許可
          → register() / onRegistered() で FID
          → redeemPushInvite2 が照合して
             restaurants/{restaurantId}/pushRegistrations/{fid} に保存し、招待を使用済みにする
注文発生: notifyRestaurant() → その店舗の登録のうち notify が立つ FID へ
          sendEachForMulticast({ fids, data }) で送信
端末:     sw.js の onBackgroundMessage → showNotification → タップで該当注文画面へ
```

### ワンタイム URL を DB から読ませない

- doc id はトークンそのものではなく **SHA-256**。DB が漏れても URL は復元できない
- `firestore.rules` で `pushInvites` は read も write も拒否する。`list` だけ塞いでも、
  doc id（＝トークン）を知っていれば `get` できてしまう
- クライアントはトークン doc を一度も読まない。照合は Callable の中だけで起きる
- 照合と使用済みの記録は1つのトランザクションに入れる。分けると、同じ URL を同時に開いた
  2台が両方とも「未使用」を読んで両方登録できてしまう

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

**管理者**（サインイン済み）

1. 注文画面の「通知設定」→「プッシュ通知の端末」、または
   `/admin/restaurants/{店舗ID}/pushlist` を開く
2. 「端末を追加」を押すとワンタイム URL と QR が出る
3. 通知を受け取りたい端末にその URL を渡す

URL は**その場で一度しか表示されない**。サーバはハッシュしか持たないので、
閉じたら作り直す。

**端末を登録する人**（サインイン不要）

1. 受け取った URL を開く
2. iOS のみ: 共有 → 「ホーム画面に追加」→ **追加したアイコンから開き直す**
   （Safari のタブのままでは通知を受け取れない。トークンは URL に載るのでアイコンに引き継がれる）
3. 端末の名前を入れて「通知を受け取る」を押し、通知を許可する

登録後は管理者の一覧に名前が並び、そこで ON/OFF と削除ができる。

### 5. 動作確認

`/admin/webpush` に確認用ページがある。店舗 ID を入れて登録 / テスト送信ができ、
FCM の失敗コード・Service Worker の scope / state・通知許可の状態がログに出る。
このページの「登録」は招待を作ってその場で使うので、`createPushInvite2` と
`redeemPushInvite2` の両方を一度に通せる。

## ハマりどころ

### 1. iOS はホーム画面に追加した PWA のみ

iOS Safari のタブでは `window.Notification` 自体が存在しない。登録ページでは
`isWebPushSupported()` が false になるので、登録の導線を出さずに
「ホーム画面に追加して開き直す」手順だけを表示する。

### 2. 通知許可はタップ操作が起点でないと出せない

`Notification.requestPermission()` はユーザー操作のハンドラ内から呼ぶ必要がある。
`isSupported()` は IndexedDB を開いてクリックの transient activation を使い切るので、
**permission を先に取ってから** `isSupported()` を待つ（`checkPreconditions()`）。

### 3. 招待が使えることを確かめてから installation id を回す

`register()` の前に installation id を回すのは下の理由で必要だが、**回す前に招待が使えるか
確かめないといけない**。`checkPushInvite2`（未認証・状態を変えない）を、画面を開いた時と
破壊的な手順の直前の2回呼んでいる。

確かめずに回すと、招待が弾かれたときに Firestore に残った古い FID が死に、端末は新しい FID を
持ったまま登録先が無い状態になる。招待は使い切りなので、その端末は自力で戻れない。
**PWA の `start_url` が招待 URL そのもの**なので、これはホーム画面から起動してボタンを
押すだけで起きる。登録済みの端末には「この端末は登録済みです」と出し、ボタンを出さない
（招待に `usedByFid` を残して見分けている）。

### 4. なぜ installation id を回すのか

`register()` は自前のキャッシュから成功を返す（保存済み FID が一致し更新期限内なら FCM に問い合わせない）。
FCM 側で既に落とされた登録はここから見えず、送信して初めて分かる。そのときサーバは prune 済みなので、
押し直しても同じキャッシュに当たり、端末は何日も登録できないままになる（mulmoserver#148）。

`unregister()` / `deleteToken()` では直せない。どちらもサーバ側の削除を先に行い、
落ちた登録が返す 404 で throw してローカルの掃除まで到達しないため。
そこで登録前に **購読の破棄と installation id の回転** を両方走らせる（`resetBeforeRegistering()`）。
2つは独立していて、直列に繋ぐと片方の失敗でもう片方がスキップされるので `allSettled` で並べる。

### 5. onRegistered のハンドラは外さない

SDK の `register()` は通知を送った**あと**にもハンドラの存在を確認し、installation id が変わると
SDK 自身が `register()` をもう一本キューに積む。FID を受け取った時点で解除すると後続が
`messaging/invalid-on-registered-handler` で落ちる。ハンドラは一度張ったまま、
待ち受けリスト（`fidWaiters`）側で解決する。

### 6. payload に tag を付けない

同じ tag の通知は既存を置き換えるだけで、`renotify` が無い限り再通知されない。
実機で「1通目だけ出て以降沈黙する」状態になったため、SW・前面ハンドラ・payload のいずれにも tag は持たせない。

### 7. Service Worker のキャッシュと scope

`public/sw.js` は何もキャッシュしない（`caches` 不使用、`fetch` ハンドラは `respondWith` を呼ばない空実装。
Chrome がインストール導線を出す条件を満たすためだけに置いてある）。
加えて `firebase.json` で `/sw.js` を `Cache-Control: no-cache` で配信する。

scope は2つある。管理画面が `/admin/`、ワンタイム URL の登録ページが `/pushdevice/`。
登録ページは非ログインの端末が開くので `/admin/` の外にあり、別 scope が要る。
同じ `sw.js` を2つの scope で登録する形で、注文者が開く店舗ページはどちらにも入らない。

firebaseConfig は環境ごとに違うため、登録 URL のクエリで SW に渡す（`sw.js` を環境別に作らずに済む）。

### 8. 通知タップ時のタブ選択

`clients.matchAll({ includeUncontrolled: true })` は scope の外にある同一オリジンのページ
（注文者が開いている店舗ページなど）も返す。絞らないと、管理画面の通知が注文者のタブを
奪って管理画面へ飛ばしてしまう。

再利用するタブは、**その通知の行き先の先頭セグメントと同じ区画のもの**だけに絞る。
`/admin/restaurants/…` なら `/admin/` のタブ、`/u/…` なら `/u/` のタブ。`/admin/` を定数で
持たないのは、注文者向けの通知を足すときにこのファイルを直さずに済ませるため。

行き先が別オリジンなら**入口で落とす**（`ownOriginTarget()`）。落とさないと、別オリジンの
path から自分のオリジンの区画を割り出し、無関係なタブを掴んでそちらへ飛ばそうとする。
接頭辞を行き先自身のオリジンから組んでいるのも同じ理由で、万一すり抜けてもどのタブにも
一致しない。

### 9. サインアウトでは端末を外さない

登録は店舗に紐づくので、誰かがサインアウトしても店舗の通知端末は残る。LINE と同じ扱い。
端末を外すのは一覧画面からの削除（または OFF）だけ。

### 10. macOS / Windows で通知が出ない

`Notification.permission === "granted"` でも、OS 側の通知設定でブラウザが OFF だったり
集中モードだと表示されない。切り分けは開発者コンソールで
`navigator.serviceWorker.ready.then(r => r.showNotification("test", { body: "hi" }))` を直接実行する。

## 注文者側に広げるとき

いまは店舗運営者向けだけだが、注文者への LINE 通知を置き換える計画がある。
**Service Worker は既にどちらでも使える形にしてある**（通知タップ時のタブ再利用は、
`/admin/` 固定ではなく通知自身の行き先から決める）。残りは足すだけで、既存を直す必要は無い。

足りないもの:

| | 内容 |
| --- | --- |
| manifest | 注文者用をもう1枚。`scope` / `start_url` を注文者側の区画にして、注文者側の wrapper から `useHead` で差す |
| SW の登録 | `registerServiceWorker(scope)` は scope を引数に取るので、注文者側の scope 定数を1つ足すだけ |
| 登録の保存先 | `restaurants/{id}/pushRegistrations` は店舗固定。注文者は `users/{uid}/pushRegistrations` になるので、`registrationsCollection()` と `sendWebPush()` の引数を「所有者のパス」に一般化する |
| rules | `users/{uid}/pushRegistrations` を足す |
| payload | `createWebPushData(title, body, url)` は汎用。`createOrderPushData()` が `/admin/...` を作るので、注文者向けの組み立てを1本足す |

**ワンタイム URL は要らない。** あれは「サインインできない端末」のための仕組みで、
注文者はサインインしている。自分の uid 配下に書くだけなので、callable で直接登録できる。

## データ

`restaurants/{restaurantId}/pushRegistrations/{fid}`

| フィールド | 内容 |
| --- | --- |
| `fid` | Firebase Installation ID（doc id と同じ） |
| `name` | 端末の呼び名。登録する人が入力する |
| `notify` | 一覧で ON/OFF する。送信時にこれで絞る |
| `platform` | `ios` / `android` / `other` |
| `invitedBy` | 招待を作った管理者の uid |
| `registeredAt` | 登録時刻。一覧に出す |
| `updatedAt` | 登録・更新時刻 |

- doc id が FID なので、同じ端末で再登録しても doc が増えない。
- 一覧・ON/OFF・削除・名前の変更はクライアントから直接行う。rules は `lines` と同じ権限。
- `registeredAt` は後から足したので、それ以前の登録には無い。一覧は `updatedAt` に
  フォールバックする（`updatedAt` は引き換え時にしか書かれないので登録時刻と同じになる）。
- 名前の長さは一覧からの変更では縛らない。見分けにしか使わないため。
- 新規登録は招待経由なので Functions が書く。
- 送信が「宛先そのものが無効」を示すコードを返した FID だけを削除する。
  `messaging/invalid-argument` は payload 不正でも返るため、削除の根拠にしない。

`pushInvites/{tokenHash}`（トップレベル）

| フィールド | 内容 |
| --- | --- |
| `restaurantId` | 招待の対象店舗 |
| `createdBy` | 作った管理者の uid |
| `createdAt` / `expiresAt` | 期限（`PUSH_INVITE_TTL_MS`） |
| `usedAt` | 使用済みの印。一度使ったら再利用できない |

クライアントから read も write もできない。

送信結果は `restaurants/{restaurantId}/log/{date}/webPushLog/{orderId}-{messageId}` に記録される。
