# utils.ts の残りの純粋な関数に試験を足す

omochikaeri-docs#196 の続き。**実装には触らない。**

## 対象

`src/utils/utils.ts` のうち、注文・配達・検証に関わる純粋な関数で試験が無かったもの:

`arrayChunk` / `array2obj` / `countObj` / `cleanObject` / `forceArray` /
`haversine_distance` / `orderFilter` / `errorCode` / `errorMessage`

## 読まないと分からなかったもの

書く前に実際に走らせて確かめた。予想で書くと、実装を書き写すだけの試験になる。

- **`haversine_distance` は메ートルの整数を返す。** 名前にも戻り値にも単位が出てこない。
  `Math.round(d * 1000)` で初めて分かる
- **`countObj` は object の鍵を数えない。** 値に降りて配列の要素だけを数えるので、
  `{ a: 1, b: 2 }` は **0**。「項目数」を期待すると合わない
- **`arrayChunk` の大きさの既定は1。** 渡し忘れると1件ずつになり、問い合わせの回数が要素数と同じになる
- **`arrayChunk(arr, 0)` は空の塊を要素数だけ返す。** 要素が1つも入らない
- **`cleanObject` は 0 と空文字を落とさない**（`isNull` で見ているため）。
  落とすと「0円」「未入力」が保存されなくなる
- **`array2obj` は id の無いものを黙って落とす**。同じ id なら後が勝つ

## 確かめ方

規則ごとに実装を壊して赤くなることを確かめ、復元を md5 で照合する。
