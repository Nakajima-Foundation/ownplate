# e2e: 注文一覧を、その注文の受取日で開く

## なぜ

`adminOrderScreens.spec.ts` の「注文一覧」は、注文一覧を `?day=` なしで開いていた。一覧は受取日で絞り、既定は今日。種まきの店は、閉店間際（20:35 JST 以降）の注文の受取が翌日になるので、その時刻に走るとカードが見つからず落ちる。#2069 の CI（20:49 JST）で落ちた。

## やること

- 注文を出したあと、Firestore の REST から `timePlaced`（受取時刻）を読み、`dateKeyOf`（JST）でその日の一覧（`?day=`）を開く。
- `shopState.ts` の `orderTimes` に `timePlaced` を足す。

## 確かめたこと

20:52 JST に、手元のエミュレーターで次を確かめた。

- `main` の spec は「注文一覧」で落ちる。
- 直した spec は 5件とも通る。
