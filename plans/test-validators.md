# 検証・送料・境目に試験を足し、機械的に穴を探す

omochikaeri-docs#196 の続き。**実装には触らない。**

## 対象

`src/utils/utils.ts` の `validUrl` / `validLocation` / `validPlaceId` / `getSoundIndex` /
`resizedProfileImage`。

前の2つ（`validUrl` / `validPlaceId`）は**店舗が自分で入力した値が客の画面へ出る**経路にある。

## 留める規則

- **`validUrl` は仕組み（scheme）を必須にし、http と https しか通さない。** ここを緩めると
  `javascript:` や `data:` が店舗の入力欄から入る
- **`validPlaceId` は未設定を通す。** 必須にすると場所 ID を持たない店舗が保存できなくなる
- **`getSoundIndex` は知らない名前でも先頭の音に落ちる。** 鳴らないほうが困るため
- **`resizedProfileImage` は、頼んだ大きさが無ければ元の写真に落ちる**

## 直さずに留めるもの

`validLocation` の境目の扱いについて、確認すべき点を omochikaeri-docs#207 に記録した。
この PR では挙動を変えず、いまの形を試験で留めるに留める。

## 確かめ方

規則ごとに実装を壊して赤くなることを確かめ、復元を md5 で照合する。


## 機械的に穴を探した

手で選んだ変異では「網羅した」と言えないので、**総当たりで壊す道具**を書いて掛けた。
`>=` ↔ `>`、`===` ↔ `!==`、`&&` ↔ `||`、`??` → `||`、`true` ↔ `false`、数値 +1 を
1箇所ずつ当て、試験が赤くならなかったものを穴として拾う。コメントと文字列の中は除外する。

### 覆いを足した関数

`costCal`（**試験が1つも無かった**）/ `isEmpty` / `isNull` / `taxCategories` の境目 /
`formatOption` の境目 / `getNewItemData` の素通し / `copyMenuData`

### 等価な変異（穴ではない）

`?? → ||` は、**既定値と falsy 値が一致する**場合は等価になる（`x ?? ""` で x が `""`、
`x ?? 0` で x が `0`）。`newExceptHour` の比較も、同じ値の入れ替えが無動作なのと
`isNull` が先に undefined を弾くので等価。これらは試験の穴ではない。

### 試験できないもの

`userPermission.checkAdminPermission` は `useUserStore` / `useRouter` / `useRoute` を使う
composable なので、この形では試験できない。
