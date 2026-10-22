# 通知の失敗で、確定済みの処理を落とさない

背景: omochikaeri-docs#236

## いまの作り

通知を呼ぶのは、注文の確定や Stripe の capture が済んだ**あと**。その呼び出しは囲われて
いない。通知の中も、経路が順に並んでいて互いに囲われていない。

結果、経路が1つ落ちると:

- 残りの経路が走らない
- 例外が callable の境界まで抜け、呼び手にはエラーが返る

Web Push だけは「他を巻き込まないように」と囲ってあったが、同じ配慮が他の経路には
入っていなかった。

## 変えること

取り決めを1つにする。**「通知の失敗で、確定済みの処理を落とさない」**。

1. `functions/src/functions/notify/isolate.ts` に `runIsolated` を置く。順番を保ったまま
   1つずつ走らせ、落ちたものを記録して次へ進む。依存を持たないので単体で試験できる
2. `notifyRestaurant` の5経路（LINE / メール / 開いている管理画面 / Web Push / 電話）を
   それぞれ切り出し、`runIsolated` に渡す
3. 通知の入口3つ（`notifyNewOrderToRestaurant` / `notifyCanceledOrderToRestaurant` /
   `sendMessageToCustomer`）を投げないようにする。呼び手は7箇所あるが、入口側で守れば
   呼び手は触らなくて済む
4. Web Push の中にあった try/catch は外す。守りが二重になると、どちらを壊しても試験が
   気づかない

## 確かめ方

- `runIsolated` の単体試験。`functions/tests/unit/` に置くので **CI（`ci_test`）で回る**
- **実際に注文を通す**。LINE の経路を必ず落とした状態で、emulator の注文 e2e を走らせ、
  同じ変異を直す前のコードにも当てて比べる

## 範囲の外

- 通知を注文の応答から切り離す（trigger や Pub/Sub へ移す）のはやらない。この repo に
  Firestore trigger は1本も無く、新しい配備の形を入れる話になる。判断済み
- 失敗を店が見られるようにするのは #235。ここでは console に残すだけ
