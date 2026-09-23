# 店舗が入力する値の検証と、表示の落とし先に試験を足す

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
