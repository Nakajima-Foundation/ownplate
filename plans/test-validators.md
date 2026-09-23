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

**`validLocation` は緯度0・経度0 を弾く。** `location.lat || ""` と書いてあるため、
0 が空文字になって `isLatLong` に渡る。赤道上・本初子午線上の座標は通らない。

日本向けの店舗では届かないので直さない。いまの挙動として留めるに留める。届くようになれば
この試験が根拠になる。

## 確かめ方

規則ごとに実装を壊して赤くなることを確かめ、復元を md5 で照合する。


## 機械的に穴を探した

手で選んだ変異では「網羅した」と言えないので、**総当たりで壊す道具**を書いて掛けた。
`>=` ↔ `>`、`===` ↔ `!==`、`&&` ↔ `||`、`??` → `||`、`true` ↔ `false`、数値 +1 を
1箇所ずつ当て、試験が赤くならなかったものを穴として拾う。コメントと文字列の中は除外する。

### 見つかった本物の穴

| 場所 | 何が漏れていたか |
| --- | --- |
| `commonUtils.costCal` | **試験が1つも無かった**（送料の計算。サーバの注文確定でも呼ばれる） |
| `commonUtils.isEmpty` / `isNull` | 試験が無かった |
| `commonUtils.taxCategories` | 売上ちょうど1円・税額が未設定の枝 |
| `strings.formatOption` | `+` を付ける境目（ちょうど1円） |
| `menu.getNewItemData` | 別名・昼夜・除外日の素通し、`availableLunch: false` の枝 |
| `menuUtils.copyMenuData` | 消された商品からの複製 |

### 等価な変異（穴ではない）

`?? → ||` は、**既定値と falsy 値が一致する**場合は等価になる（`x ?? ""` で x が `""`、
`x ?? 0` で x が `0`）。`newExceptHour` の比較も、同じ値の入れ替えが無動作なのと
`isNull` が先に undefined を弾くので等価。これらは試験の穴ではない。

### 試験できないもの

`userPermission.checkAdminPermission` は `useUserStore` / `useRouter` / `useRoute` を使う
composable なので、この形では試験できない。
