# 端末登録の QR を、その招待で登録されたときだけ閉じる

背景と積み残しの経緯: omochikaeri-docs#233

## いまの作り

#2084 で「登録が済んだら QR を消す」を入れた。招待そのものはクライアントから読めない
（`firestore.rules` が `pushInvites` を塞いでいる）ので、**端末の登録日時が招待を出した
時点から変わったか**で推定している。

そのため、どの招待で登録されたかは区別できない。区別するための仕掛け
（`registrationStamps` / `hasRegisteredSince` / `baselineAtInvite` / `inviteWatchAction`、
スナップショットがキャッシュ由来かの判定、`includeMetadataChanges`）が積み上がっている。

## 変えること

**招待の id を登録の側に残して、突き合わせる。**

招待文書の id は既に `hashInviteToken(token)` なので、新しく作るものは無い。

| 場所 | 変更 |
| --- | --- |
| `functions/src/functions/webPush.ts` `createPushInvite` | 返り値に `inviteId` を足す |
| `functions/src/functions/webPush.ts` `redeemPushInvite` | 登録文書に `registeredByInvite` を書く |
| `src/models/functionTypes.ts` | `CreatePushInviteResult` に `inviteId` |
| `src/app/admin/Restaurants/ManagePush.vue` | 出している招待の id を持ち、その id の端末が現れたら閉じる |
| `src/utils/pushFormat.ts` | 推定の仕掛けを削除し、`registeredWithInvite` に置き換え |

見るものが1つになるので、上に挙げた仕掛けは全部消える。差し引きで行数は減る。

## 確かめ方

- `registeredWithInvite` の単体試験。判定の両側（id が空のとき／一致の向き）を壊して
  赤くなることを確認する
- **通しで動かす**: emulator で、管理画面から招待を出し、関数を直に叩いて引き換え、
  QR が閉じることと、別の招待で引き換えても閉じないことを見る
  （`test/e2e-emulator/pushInviteCorrelation.spec.ts`）
  - 端末側の登録ページは実際の FCM から installation id を取るので emulator では踏めない。
    そこだけ関数を直に叩く。引き換えは認証不要で、トークンが唯一の資格
- ルート側: `yarn test` / `yarn typecheck` / `yarn typecheck:test` / `yarn lint` / `yarn build`
- `functions/`: 共通ファイルをコピー（`scripts/copy2functions.sh`）してから
  `yarn build` / `yarn lint` / `yarn ci_test`

## 決めたこと

- 招待の id は既存のハッシュを使い、別の乱数を増やさない。クライアントはトークン自体を
  既に持っている（URL に入っている）ので、そこから導けるハッシュを返しても新たに晒すものは
  無い。引き換えには生のトークンが要るので、ハッシュだけでは何もできない
- `registeredByInvite` はサーバだけが書く。`firestore.rules` はクライアントの更新を
  `notify` と `name` に絞っているので、規則の変更は要らない
- この項目を持たない既存の登録は、常に「別の招待」と同じ扱いになる。出したばかりの招待の
  id と一致することはないので、それで正しい
