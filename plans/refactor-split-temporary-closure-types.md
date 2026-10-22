# 臨時休業日と注文の日時を、型で取り違えられないようにする（#1981 の続き）

## なぜ

`temporaryClosure` の型は `Timestamp | Date` の混ぜ型で、読む側は `seconds` の有無や `asDate` で見分けている。
どちらを渡しても型が通るので、取り違えは画面に `Invalid date` が出るまで分からない（#2044 の CSV がそうだった）。

## 方針

- 店舗設定の `temporaryClosure` は、どこでも Firestore のままの `Timestamp[]`。
  - 管理画面の `Wrapper.vue` の `toDate()` 変換はやめる。
- `Date[]` を持つのは店舗編集フォーム（`admin/Restaurants/Index.vue`）だけ。
  - 型は `ConvertedRestaurantInfoData`。
  - 保存と複製（`getEditShopInfo` / `copyRestaurant`）はこの型を受ける。
- フォームは `reactive(props.shopInfo)` で `Wrapper` の値を共有している。
  - 臨時休業日だけはフォームが自分の `Date[]` を持ち、`Wrapper` の値へは書かない。
  - 書くと、隣の画面（注文停止ページの受取日）へ `Date` が漏れる。
- 見分ける分岐はなくし、読む所で `.toDate()` する。
  - `pickupDays.ts` の `isTimestamp`
  - `ShopInfo.vue` の `instanceof Date`
- 注文の日時は `asDate(x)` をやめて `x.toDate()` にする。使う所がなくなる `asDate` は消す。

## 確かめること

- `temporaryClosureDatesOf` と `ShopInfo` の絞り込みを、変更前後で生成した `Timestamp` で比べる。
- e2e（`temporaryClosure.spec.ts`）: 編集フォームに出る・保存しても同じ瞬間の Timestamp のまま・お客様の画面に出る・受付停止ページが落ちない・消して保存すると無くなる。日付を足す操作（日付選択の部品）は通していない。
- 単体テストの臨時休業日は、実物の `Timestamp` で作る。

## やらないこと

- 注文詳細の `Number(Timestamp)` の引き算（#1981 の残り）。
- 編集フォームが `Wrapper` の値を共有していること自体（臨時休業日以外）。
