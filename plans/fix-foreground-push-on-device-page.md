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

## 範囲の外（測ったうえで見送り）

`/admin` 配下の wrapper の外にも、同じ漏れのある画面が11ある:
`/admin/news` `/admin/news/:newsId` `/admin/faq` `/admin/docs` `/admin/docs/articles/:id`
`/admin/docs/features` `/admin/user/signin` `/admin/user/signup`
`/admin/user/signup/:partner` `/admin/user/reset` `/admin/user/action`

登録済みの端末がこれらを開いている間も通知は出ない。router の遷移で一律に張れば
一網打尽にできるが、**全遷移に触る変更**になり、報告があったのは端末の画面だけ。
確定している分だけ先に出し、こちらは #234 に残す。
