# 商品と注文のデータを組み立てる純粋な関数に試験を足す

omochikaeri-docs#196

## 何をするか

ownplate#1829 で直下の試験が tsx で走るようになり、`src/models/` が読めるようになった。
商品と注文のデータを組み立てている純粋な関数に試験が1つも無いので、まとめて足す。

**実装には触らない。**

## 対象

- `src/utils/strings.ts` — `nameOfOrder` / `formatOption` / `halfCharactors`
- `src/models/menu.ts` — `getNewItemData`
- `src/models/menuUtils.ts` — `copyMenuData` / `getBlankMenuItem` / `getBlankTitleItem`
- `src/utils/price.ts` — `roundPrice`

## 留める規則

読まないと分からないものを優先する。「この関数はこう書いてある」ではなく
「この規則が壊れると何が起きるか」を試験の名前と注釈に書く。

- 検証を通っていない商品は公開されない（`publicFlag` は `validatedFlag` が偽なら必ず偽）
- 複製した商品は公開されない
- 保存すると売り切れが解除される（`soldOut` は常に偽）
- 日本円なら価格は整数に丸められる
- 除外時間は逆順に入れると入れ替わる。片方でも未設定なら空
- 画像は `item` 以外を落とす
- 新規作成の既定は公開（omochikaeri-docs#60 の挙動。現状を留めるだけ）

## 確かめ方

規則ごとに、実装を壊して赤くなることを確かめる。壊したあとは元に戻し、
md5 で byte 一致を確認する。

`as` も `any` も使わない。`MenuData` と `TitleData` は必須の項目を並べた
小さな組み立て関数から作る。

## やらないこと

`src/utils/utils.ts` のカート金額の計算には手を出さない。`src/lib/firebase/firebase9.ts` が
読み込んだ瞬間に Firebase を初期化するので、走らせ方では開かない。切り出しが要る別の作業。

`getBlankMenuItem` が公開の既定で作ること（omochikaeri-docs#60）は**変更しない**。
現状を試験で留めるだけ。
