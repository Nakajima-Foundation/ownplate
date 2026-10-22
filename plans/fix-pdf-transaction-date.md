# 受付前キャンセル注文の PDF に取引年月日を出す

omochikaeri-docs#181

## 何を直すか

`printOrderData` の日付は `受渡時間:` の1行だけで、`orderInfo.timeEstimated` にぶら下がっている。
`timeEstimated` は受付時（`status === order_accepted`）にしか書かれない。印刷ボタンは
`status !== order_placed` なら出るので、受付前にキャンセルされた注文では**日付がどこにも無い
PDF** が出る。取引年月日は適格簡易請求書の必須要素で、PR #1813 で登録番号を印字するように
なった以上、これは書類として成立していない。

## 落とし先

`timePlaced` に落とす。名前は嘘で、中身は `timeToPickup`（注文者が希望した受渡時刻）が
そのまま入っている — `orderPlace.ts` の `const timePlaced = new Timestamp(timeToPickup...)`。
つまり `timeEstimated` と同じく受渡の時刻であり、取引年月日の代わりとして正しい。
レシート側も同じ値を「受渡希望時間」として出している。

ラベルは分ける。希望時刻を「受渡時間」と書くと、店舗が確定した時刻に見える。
レシートと同じ語を使う。

- `timeEstimated` あり → `受渡時間:`（現状のまま、**受付済みの注文の PDF は一切変わらない**）
- 無い → `受渡希望時間:`

## どう書くか

`pdf2.ts` は `pdfmake` を top-level import し、モジュール読み込み時に `location.protocol` を
評価するので、node から読めない = 単体テストできない。判断をここに置くと、この欠陥は
テストで固定できないまま残る。

判断だけ純関数として `src/utils/orderDocumentDate.ts` に切り出し、`pdf2.ts` は
どちらのラベルを出すかを受け取るだけにする。どちらの行かは `kind` で決まる（日付の値では
見分けない）。

## 確認

- `test/unit/test_orderDocumentDate.ts` — 受付済み / 未受付 / どちらも無い
- 変異: フォールバックを消すと赤になること
- `yarn format` → `npx eslint src` → `yarn test` → `yarn build`

## やらないこと

- レシートは触らない。受付後も希望時刻を出し続けるという別の食い違いはあるが、
  直すと全レシートの表示が変わる
- 取引年月日そのものを注文ドキュメントに保存する設計変更（#178 の領域）
