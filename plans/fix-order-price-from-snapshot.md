# 注文の再計算を、生きたメニューではなく注文時の写しから行う

omochikaeri-docs#187 の PR B（**金額の計算結果が変わる**）

## 背景

注文は選んだオプションを**位置**で保存し、金額の再計算は**生きたメニュー**を引く。

```
functions/src/functions/order/orderCreated.ts
  const menu = menuObj[menuId]            ← getMenuObj = 生きたメニュー
  const price = menu.price + selectedOptionsPrice(rawOptions, menu.itemOptionCheckbox, ...)
  if (menu.tax === "alcohol") ...
```

店主が後から注文を編集すると `functions/src/functions/stripe/orderChange.ts` がこれを走らせる。
だから **オプションを並べ替える / 値段を変える / 税区分を変える** と、既に受けた注文の金額が
その時点の設定で計算し直される。

注文文書は既にメニューの写し（`menuItems`）を持っているが、**`itemOptionCheckbox` が入って
いない**ので、オプションの金額だけは生きたメニューを引くしかなかった。さらに `orderChange` は
編集のたびに `menuItems` を生きたメニューで**上書き**するので、写しも残らない。

## 方針

**写しが使えるならそこから計算し、写しは上書きしない。**

| | いま | この PR のあと |
| --- | --- | --- |
| `price` | 生きたメニュー | 写し（無ければ生きたメニュー） |
| `itemOptionCheckbox` | 生きたメニュー（写しに無い） | 写し（無ければ生きたメニュー） |
| `tax`（食品 / 酒） | 生きたメニュー | 写し（無ければ生きたメニュー） |
| `soldOut` | 生きたメニュー | **生きたメニューのまま**（写しに無い。いまの挙動を変えない） |
| `menuItems` の書き戻し | 毎回、生きたメニューで上書き | 使った写しをそのまま戻す |

### 写しが「使える」かの判定は `itemOptionCheckbox` の有無

既存の注文の写しには `itemOptionCheckbox` が無い。**半分だけ写しを使う**（値段は写し、
オプションは生きたメニュー）と、どちらとも違う金額になりうる。なので判定は一つにする:

- `itemOptionCheckbox` **がある** → 新しい形の写し。値段・オプション・税区分すべて写しから
- **無い** → 生きたメニューから。**いまと同じ計算**

結果として、**古い注文は最初の編集までいまと同じに動き**、その編集で新しい形の写しに置き換わり、
それ以降は凍る。新しい注文は最初から凍る。

## 変更するもの

- `src/models/menu.ts` — `MenuItem` に `itemOptionCheckbox?: string[]` を足す（`functions` へコピーされる）
- `functions/src/functions/order/menuSnapshot.ts`（新規、純粋） — 写しを作る / 写しが使えるか判定する / 計算に使う側を選ぶ
- `functions/src/functions/order/orderCreated.ts` — `createNewOrderData` がその判定を通る
- `functions/tests/unit/menu_snapshot_test.ts`（新規）

## 確かめ方

金額が変わる変更なので、突き合わせでは確かめられない。代わりに:

1. 純粋な関数として `node:test` で固め、壊して赤くなることを確認する
2. **どの入力で金額がどう変わるかを表にして出す** — 変わらない場合（古い注文の初回編集、
   並べ替えていないメニュー）と、変わる場合（並べ替え後、値段変更後、税区分変更後）の両方

## この PR に入れないもの

- 売切れの商品が編集時に黙って落ちる挙動
- メニューが削除された注文の編集が error になる挙動
