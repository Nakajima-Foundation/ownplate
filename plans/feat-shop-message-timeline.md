# 店舗向けメッセージ timeline（書き込み側）

背景と決定: omochikaeri-docs#235

LINE の通知を畳むので、その代わりになる店舗向けの timeline を作る。LINE の talk が
店にとっての控えだったので、消すと「何を知らされたか」を遡る先が無くなる。

**この回は書き込みだけ。画面と規則は次。**

## 前提（決定済み）

| | |
| --- | --- |
| 対象 | 店舗側のみ。客側の LINE は当面そのまま |
| 粒度 | いま店へ LINE を送っているのと同じ（`msg_order_placed` と `msg_order_canceled_by_user`） |
| 書き込み | 配信とは**独立**。端末を登録していない店でも、通知が1つも届かなくても書く |
| 「届いたか」 | timeline には**持たない**。配信の記録は Web Push のログが正 |
| 未読 | 持たない |
| 過去分 | 埋めない。書き始めた日から |

## 置き場と中身

`/restaurants/{restaurantId}/messages/{orderId}-{messageId}`

id を注文と種別から作るので、同じ通知が二度走っても行が増えない。

残すのは、**送った文面の本文**と、種別・注文 id・注文番号・注文へのパス・時刻。
末尾に付けていた URL は `path` に分けて持つ（画面ではリンクにする）。
あとから i18n で組み直すと「送っていない文面」を見せることになるので、送ったままを持つ。

## どこで書くか

`notifyRestaurant` の `runIsolated` に渡す task の**一番最初**。

- 共有の準備部分には置かない。そこで落とすと全経路が死ぬ（ownplate#2086）
- task なので、timeline が落ちても通知は止まらない
- 逆に、通知のどれが落ちても timeline は残る

## 確かめ方

- `shopMessageFormat.ts` の単体試験。**CI（`ci_test`）で回る**
- **実際に注文を通す**。`test/e2e-emulator/shopMessageTimeline.spec.ts`。種まきの店舗は
  LINE も端末登録も持っていないので通知はどこへも届かない。それでも1件残ることを見る
  （＝配信と独立していることの確認でもある）
- task を外して functions を建て直すと、この e2e が赤くなることを確認

## 次（この回の範囲外）

- 画面（`/admin/restaurants/:restaurantId/messages`）
- `firestore.rules` の読み取り許可。**読み手が無いうちに規則だけ入れると、動かして
  確かめられない**ので画面と同じ回に入れる
