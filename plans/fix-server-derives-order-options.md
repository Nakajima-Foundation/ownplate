# 注文の表示用オプションを、サーバが位置から作る

omochikaeri-docs#193

## 背景

注文は選択を**位置**（`rawOptions`）で保存し、**表示用の文字列（`options`）は client が作って送る**。
サーバはそれを検証せずそのまま保存する（`orderCreated.ts:245` の「just copy original data.」）。

当てる先のメニューが両者で違う:

|              | 何に当てるか                          |
| ------------ | ------------------------------------- |
| 金額         | サーバが送信時点の生きたメニュー      |
| 表示の文字列 | client がカートに入れた時点のメニュー |

カートは凍る（`RestaurantPage.vue:612` が追加時のオブジェクトを参照で持ち、`useMenu` は
`onSnapshot` のたびに配列を丸ごと差し替える）。再現は #193 に記録。

## 方針

**サーバが `rawOptions` から表示用の文字列も作る。** `createNewOrderData` は金額を計算する行で
`rawOptions` と `menu.itemOptionCheckbox` を両方持っているので、そこで一緒に作れる。

解決の規則は `src/utils/utils.ts` の `getPostOption` が持っているものなので、
`selectedOptionsPrice` の隣（`src/utils/commonUtils.ts`）に寄せ、画面とサーバが同じ規則を通る形にする。

## 変更するもの

- `src/utils/commonUtils.ts` — `selectedOptionNames` を置く
- `src/utils/utils.ts` — `getPostOption` がそれを使う
- `functions/src/functions/order/orderCreated.ts` — `createNewOrderData` が `newOptions` も作って返し、
  `orderCreated` が client の `options` の代わりにそれを保存する

## 数量 0 の行のずれも一緒に直る

サーバは `num === 0` の行を落とすのに、保存される `options` は client のまま全行ぶんだった。
画面側は同じ添字で読む（`src/utils/utils.ts:270-272`）ので、`[0, 2]` のような数量でずれていた。
同じループで作るので揃う。**これは挙動の変更**なので、確認項目に入れる。

## 挙動が変わらないことの確かめ方

**メニューが変わっていない注文では、サーバが作る文字列が client のものと一致すること。**
一致しなければ、すべての注文のレシートが変わる。

`getPostOption`（画面）と `selectedOptionNames`（寄せた規則）を、生成した入力で全件突き合わせる。

## 確認すること

- 普通の注文で、レシートのオプションと金額がこれまでと同じ
- カートに入れたあと並べ替えて送信すると、支払い前の画面に請求される内容が出る
- 同じ商品を2組入れて片方を 0 にした注文で、レシートのオプションが正しい行のものになる
- 選択肢を減らしたメニューで、範囲外の位置が空として扱われる

## この PR に入れないもの

客が見たメニューと違えば会計を止める、という判断（会計の失敗経路が増える）。
