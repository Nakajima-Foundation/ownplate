# Firestore の読み込みに型を付ける（4: super 画面）

## やること

- `src/models/superLogs.ts` を足す。
  - 管理者の操作ログ（`adminlogs`）。書き手は functions の `super.ts`。
  - 電話のログ（`phoneLog`）。書き手は functions の `notify2.ts` / `super/twilio.ts`。
  - Stripe の callback ログ（`stripeLogs`）。書き手は functions の `stripeLog.ts`。
  - 掲載の申請（`requestList`）。書き手は管理画面の店舗カード。
- 型を当てる所:
  - 操作ログ / 電話ログ / Stripe の callback 一覧 / 申請一覧
  - お気に入り一覧（`ReviewData`。`timeLiked` で並べて読むので `timeLiked` は必ずある）
  - 店舗の表示
  - 管理者の詳細の店舗一覧

## 実行時の動き

- 値と分岐は変えない。
- 増えるのは `collectionData`（引数をそのまま返す関数）の呼び出しだけ。項目がそろった型に `DocumentData` を入れるため。

## やらないこと

- 管理アカウント（`admins/:uid` と `private/profile`）を読む所。対象は `Partner.vue` / `Profiles.vue` / `AdminInfo.vue` の管理者の欄 / `AllAdmins.vue`。
  - この文書は `ShopOwnerData`（`hidePrivacy` など）が一部を表している。新しい型を足すと二重になる。
  - まとめるには `hidePrivacy` を省略可にするかを決める必要があり、functions にも関わる。
- Stripe の callback の詳細（`StripeCallback.vue`）。文書が無いとき `null` にする式を書き換えないと型が付かない。
- 画面が `log.data.uid` を読んでいるが、今の書き手は `data` に `log` しか入れない（古い文書の形と思われる）。型は両方を省略可にしてある。
