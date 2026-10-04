# 端末の画面を開いている間も、通知が出るようにする

背景: omochikaeri-docs#234

## いまの作り

FCM は**同一オリジンの画面が前面にあると `onBackgroundMessage` ではなく `onMessage`
に回す**。そのため前面のときは自分で表示しないと何も出ない。

受け口 `listenForegroundPush()` はある（`src/utils/webPush.ts`）が、呼んでいるのは
`src/app/admin/Wrapper.vue` だけで、`/admin` 配下にしか効かない。

一方、端末側の PWA は `start_url` が `/pushdevice/<token>`。**厨房の端末はホーム画面から
起動するたびにこの画面に着く**が、この画面は受け口を張っていない。開いている間、通知は
1件も出ない。

## 変えること

1. `src/utils/attachOnce.ts` に掛け金を追加。`onMessage` は呼ぶたびに受け口を足すので、
   二度張ると1件の push に通知が2つ出る。同じ形の守りが既に `onRegisteredAttached`
   としてあるが、そちらは FID の経路で経緯があるので触らない
2. `listenForegroundPush()` をその掛け金に通す。**二度呼んでも足されない**ので、
   画面側は迷ったら呼ぶ側に倒してよい
3. `pushDevice/Register.vue` の `onMounted` で呼ぶ

## 確かめ方

- `attachOnce` の単体試験。掛け金の両側を壊すと赤くなることを見る
- **表示そのものは手元で確かめられない**。emulator には FCM の鍵が無く
  （`isWebPushConfigured()` が false）、`listenForegroundPush` は手前で戻る。
  実機と実鍵が要る

## どこに置くか

`App.vue`（アプリ全体）には置かない。**FCM の SDK は専用の束（約20KB）に分かれていて、
入口の束には1バイトも入っていない**。全体に置くと客（大半がスマホ）全員に配ることに
なり、客側には受け取る登録が無いので見返りがゼロ。

代わりに **router で、通知を受けうる画面（`/admin*` と `/pushdevice*`）に入ったときだけ
張る**。画面の一覧を部品側に持たずに済むので、画面を足した人が忘れても壊れない。
import は動的にして、客側の束に持ち込まない（入口の増分は router の仕掛けのぶんだけ）。

画面ごとの呼び出しは外す。守りが二箇所にあると、どちらを壊しても試験が気づかない。
