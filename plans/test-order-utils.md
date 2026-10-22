# 注文まわりの純粋な関数に試験を足す

omochikaeri-docs#196 の続き。

## いま書けるようになった理由

ownplate#1833 で `getShopOwner` を切り出し、`src/utils/utils.ts` が Firebase を読まなくなった。
それまでは import した時点で `initializeApp` が走るので、この中の関数は1つも試験できなかった。

## 対象

`src/utils/utils.ts` の純粋な関数のうち、注文と商品に関わるもの。**実装には触らない。**

- `orderType` / `orderTypeKey`
- `convOrderStateForText`
- `itemOptionCheckbox2options`
- `convOptionArray2Obj`
- `taxRate` / `priceWithTax`
- `arraySum` / `arrayOrNumSum`

## 留める規則

- **EC は配達より先に見る。** 両方立っていても EC
- **EC の注文は2つの状態だけ言い換える**（`ready_to_pickup` → `ready_to_shipping`、
  `transaction_complete` → `shipping_complete`）。他は触らない
- **選択肢の前後の空白は落とす。** 残すと選択肢の名前がずれる
- **新規商品の既定 `[""]` は「オプション無し」として開く。** そのまま開くと空の選択欄が出る。
  ただしこの逃がしは長さ1のときだけで、`["", ""]` は空の組2つとして開く
- **`taxRate` と `priceWithTax` は同じ規則を2通りに書いてある。** 片方だけ直すと食い違うので、
  両者が一致することも留める
- **`arraySum([])` は投げる。** `arr || [0]` は空配列を素通しし、初期値なしの `reduce` が空で投げる

## `arraySum([])` を直さない理由

投げるのは事実だが、**いまの呼び手に空が届くかを確かめていない**。カートの点数と注文一覧の
集計から来るので、届かない可能性が高い。到達を示せていないものを直すとレビューを消費するだけなので、
いまの挙動を留めるに留める。届くようになれば、この試験が根拠になる。

## 確かめ方

規則ごとに実装を壊して赤くなることを確かめ、復元を md5 で照合する。
