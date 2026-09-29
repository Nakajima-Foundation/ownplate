# 注文の各行の計算と、注文の種類の検査を純粋関数に切り出す（omochikaeri-docs#23 の前段）

## 目的

電話注文の入力（docs#23）で、店が作る注文も、お客様の注文と同じ計算を通す。その前に、`orderCreated` の中の計算を Firebase を触らない純粋関数に切り出し、試験できるようにする。お客様の注文の動きは変えない。

## やること

- `functions/src/lib/orderLines.ts`
  - `buildOrderLines`: 注文の各行（数量・値段・オプション名）と、食品・お酒の小計を、メニューの値段から組み立て直す（`createNewOrderData` の中の繰り返しを、そのまま移す）
  - `invalidOrderKind`: デリバリー・LINE・ランチ／ディナーを店が受け付けているか（`orderCreated` の中の検査を、投げずに理由を返す形で移す）
- `orderCreated.ts` はそれを呼ぶ。メニューが見つからないときに注文を `error` にする処理は、呼ぶ側に残す
- `createNewOrderData` の形（引数と戻り値）は変えない（`orderChange.ts` からも呼ばれる）

## 同じ動きであることの確かめ方

- 切り出す前の `createNewOrderData` と注文の種類の検査をそのまま写し、新しいものと並べて、生成入力で結果（例外・注文の状態の書き込みを含む）を比べる
- 比べる仕組みそのものが差を拾えることを、新しいコードをわざと壊して確かめる
- 残す試験: `functions/tests/unit/orderLines_test.ts`。`order_line_alignment_test.ts` の「1 行ぶんを 3 つとも積む」検査は、読む先を `orderLines.ts` に変える

## やらないこと

- `orderPlace.ts` の `updateOrderTotalDataAndUserLog`（メニューごとの売上の集計と `userLog`）を分けること
  - Firestore のトランザクションは、読み込みをすべて書き込みより前に行う必要がある
  - 2 つの関数に分けて順に呼ぶと「読む → 書く → 読む → 書く」になり壊れる。読み込みと書き込みの段に分ける形で、docs#23 の本体で扱う
