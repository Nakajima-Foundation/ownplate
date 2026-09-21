# Web Push の登録を「店舗に名前付き」＋「ワンタイム URL」に変える

関連 issue: https://github.com/Nakajima-Foundation/ownplate/issues/1781
既存の設計メモ: [plans/feat-web-push.md](./feat-web-push.md) / [docs/WEBPUSH.md](../docs/WEBPUSH.md)

## 変える理由

いまの実装は登録を `admins/{uid}/pushRegistrations/{fid}` に置いている。つまり
**サインインしている管理アカウントの端末**しか登録できない。

実際に通知を受けたい端末は、厨房のタブレットやアルバイトのスマホで、**管理アカウントの持ち主とは限らない**。
その端末に管理画面のログイン情報を渡すのは筋が悪い。

LINE は既に店舗紐付けで、名前付きの一覧を持っている（`restaurants/{id}/lines/{lineUserId}` に
`displayName` / `notify`、画面は `ManageLine.vue`）。push もそこに合わせる。

## 方式

### データ

`restaurants/{restaurantId}/pushRegistrations/{fid}`

| フィールド | 内容 |
| --- | --- |
| `fid` | Firebase Installation ID（doc id と同じ） |
| `name` | 端末の呼び名。登録する人が入力する（「レジの iPad」など） |
| `notify` | 一覧で ON/OFF する。送信時にこれで絞る |
| `platform` | `ios` / `android` / `other` |
| `invitedBy` | 招待を作った管理者の uid。登録者は非ログインなので uid を持たない |
| `updatedAt` | serverTimestamp |

`pushInvites/{tokenHash}`（トップレベル）

| フィールド | 内容 |
| --- | --- |
| `restaurantId` | 招待の対象店舗 |
| `createdBy` | 作った管理者の uid |
| `createdAt` / `expiresAt` | 期限。`PUSH_INVITE_TTL_MS` で決める |
| `usedAt` | 使用済みの印。一度使ったら再利用できない |

### ワンタイム URL を DB から読めなくする

招待はトップレベルに置く。URL にはトークンしか載せないので、店舗を知らないまま
ハッシュだけで引けないと collectionGroup のクエリが要る。

- **doc id はトークンそのものではなく、その SHA-256。** DB が漏れても URL は復元できない。
- **`firestore.rules` で `pushInvites` はクライアントから read も write も拒否する。**
  `list` を塞ぐだけでは、doc id（＝トークン）を知っていれば `get` できてしまう。全部塞ぐ。
- **クライアントはトークン doc を一度も読まない。** 照合は Callable の中だけで起きる。
  クライアントは URL に載ったトークンを渡すだけ。

トークンは `crypto.randomBytes` で作る。長さは `PUSH_INVITE_TOKEN_BYTES`。

### 流れ

```
管理者（ログイン済み）
  店舗の「通知端末」画面 → 「端末を追加」
  → createPushInvite2  … トークンを作り、ハッシュを保存し、URL を返す
  → QR / コピーで端末に渡す

登録する人（ログイン不要）
  その URL を開く → 端末の名前を入れる → 通知を許可
  → FCM register() → FID
  → redeemPushInvite2 … トークンを照合して registration を書き、招待を使用済みにする

注文発生
  notifyRestaurant() → restaurants/{id}/pushRegistrations を読み、notify が立っているものへ送る
```

### 認証の考え方

- `createPushInvite2` … 管理者のみ。`validate_admin_auth` + 対象店舗へのアクセス確認。
- `redeemPushInvite2` … **認証不要**。App Check は掛ける。
  登録できる先はトークンが指す店舗だけで、トークンは推測できない。
- 一覧・ON/OFF・削除 … クライアントから直接 Firestore。rules は `lines` と同じ
  （店舗オーナーと、その店舗を担当するサブアカウント）。

## 画面

- `src/app/admin/Restaurants/ManagePush.vue` — `/admin/restaurants/{id}/pushlist`。
  `ManageLine.vue` と同じ一覧（名前・ON/OFF・削除）＋「端末を追加」＋テスト送信。
- 入口は注文画面の通知設定（`NotificationSettings.vue`）から。LINE の導線の隣に置く。
- `src/app/pushDevice/Register.vue` — `/pushdevice/:token`。公開ページ。ログイン不要。
  iOS 用の manifest は `start_url` にトークンが要るので、静的ファイルではなくその場で組み立てる。

## iOS の案内は作り込む

**iOS は「ホーム画面に追加」した PWA でしか Web Push を受けられない。** 登録する人が非ログインでも
この制約は変わらない。Apple 側の仕様なので回避できず、登録ページで明示するしかない。

| # | 操作 | 必要な理由 |
| --- | --- | --- |
| 1 | ワンタイム URL を Safari で開く | |
| 2 | 共有 → ホーム画面に追加 | Safari のタブでは Web Push を受け取れない |
| 3 | 追加したアイコンから開き直す | タブでは `Notification` が存在せず、許可ダイアログも出せない |
| 4 | 端末の名前を入れる | 一覧で見分けるため |
| 5 | 通知を許可 | |

トークンは URL に載るのでアイコンに引き継がれる。Android とデスクトップは 2 と 3 が要らない。

登録ページは **2 と 3 が済んでいない iPhone を検出して、先にその案内だけを出す**
（`isWebPushSupported()` が false になるので判定できる）。ここを出さないとアルバイトの方が詰まる。

そのため公開ページ側にも manifest が要り、`start_url` はトークンを含む URL になる。

Service Worker の scope も変わる。いまは `/admin/` に閉じているが、登録ページは `/admin/` の外なので、
**登録ページ用に別 scope で登録する**（例: `/pushdevice/`）。同じ `sw.js` を別 scope で登録するのは
問題なく、2つは独立して動く。注文者が開く店舗ページは、どちらの scope にも入らない。

## 消えるもの

置き換えなので、いまの実装から次が不要になる:

- `admins/{uid}/pushRegistrations` とその rules
- `registerWebPush2` / `unregisterWebPush2` の Callable・wrapper・validator・型
  （登録は招待経由、解除は一覧からの直接削除になる）
- `notifyTargetUids()` / `restaurantNotifyUids()` / `getChildren()` / `WebPushChild`
  （送信先は店舗のコレクションを読むだけになり、オーナーと children の解決が要らなくなる）
- サインアウト時の後始末（`signOutAfterDisablingPush()` / `disableThisDevice()`）
  登録が店舗に紐づくので、誰かがサインアウトしても店舗の通知端末は残る。LINE と同じ扱い。
- 通知設定画面（`NotificationSettings.vue`）のアカウント単位トグル

`/admin/webpush` のテストページは**残す**。店舗を選んで登録・送信できるよう、
店舗紐付けに合わせて中身だけ直す。

## 確認観点

- [ ] 管理者がワンタイム URL を作れる。URL は一度しか使えず、期限切れも弾かれる
- [ ] 非ログインの端末がその URL から登録できる
- [ ] `pushInvites` はクライアントから read も list もできない（rules のテスト）
- [ ] 一覧で名前が出て、ON/OFF と削除ができる
- [ ] 実際の注文で、`notify` が立っている端末にだけ届く
- [ ] iOS でホーム画面に追加してから登録できる
- [ ] 注文者の店舗ページに Service Worker も manifest も入らない
- [ ] 登録が無い店舗でも、既存の LINE / メール / 電話 / 通知音 が従来どおり動く

## テスト

- `functions/src/functions/notify/pushInviteFormat.ts` に純関数を切り出し、
  `functions/tests/webpush_test.ts` でトークンの生成・ハッシュ化・URL 組み立て・
  照合の失敗側（期限切れ / 使用済み / 存在しない / 形式不正）・端末名の既定値と上限を見る。
- 照合と使用済みの記録は1つのトランザクションに入れる。同じ URL を同時に開いた2台が
  両方登録できてしまうため。
