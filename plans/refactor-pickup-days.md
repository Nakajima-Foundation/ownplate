# refactor: 受け取れる日と時刻の決まりを usePickupTime から切り出す

SingularitySociety/omochikaeri-docs#227 の 1。サーバでも同じ判定を使えるように、画面の挙動を変えずに純粋関数へ切り出す。

## やること

- `src/utils/pickupDays.ts`（新規）: Vue・store・i18n に頼らない判定
  - `availablePickupDays`（受け取れる日と時刻。`now` と「offset 日後の 0 時」を引数で受ける）
  - `withinLastOrder`、`openSlotsOf`、`businessDaysOf`、`temporaryClosureDatesOf`、`daysInAdvanceOf`
  - 時刻は 0 時からの分の数だけ返す。表示文字列（`num2time`、i18n を使う）は画面側で付ける
  - import は `./commonUtils` と `../models/RestaurantInfo` と `moment` だけ（functions にコピーできる形）
- `src/utils/pickup.ts`: `usePickupTime` はこれを呼ぶだけにする。返す値の形は変えない
- `test/unit/test_pickupDays.ts`: 判定ごとの試験と、生成した設定で成り立つ性質

## 挙動を変えないための注意

- 曜日の一覧・臨時休業・時刻の一覧は、要るところまで進んでから作る（壊れた設定で例外になるのは、画面がそこまで進んだときだけ、を保つ）
- 「今」は store の時計、「0 時」は端末の時計、という今の渡し方をそのまま保つ

## 変わること

- 例外で止まったあと、同じ画面の別の値をもう一度読んだときのエラー文言。Vue の `computed` は例外を出した後の読み出しで `undefined` を返していたが、今は毎回計算し直すので同じ例外が出る。どちらも例外で止まる点は同じ
- 「今日を飛ばす」ときのデバッグ出力が、ref ではなく真偽値を出す
- 除外設定（`exceptData.value`）と「今日を飛ばす」（`skipToday.value`、注文画面が売り切れで渡す）は、受け取れる日の候補を作る前に読む。以前は候補が 1 日でもあるときに読んでいたので、違いは候補が 0 日のとき（`pickUpDaysInAdvance` が -1）だけ。返す日と時刻は同じ

## やらないこと

- サーバでの判定（#227 の 2）。functions へのコピーもそのとき
- 「今」と「0 時」で時計が違う件（0 時直後の最大 1 分、曜日と日付が食い違いうる）は、挙動を変えないためにそのまま
