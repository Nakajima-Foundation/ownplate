# 残っていた `unknown` の読みを、出どころの型でふさぐ

これで `unknown` のまま読んでいる箇所は **0件**になる。

| 場所 | 直したもの | 型の出どころ |
| --- | --- | --- |
| `Restaurant/Menu.vue` | `selectedOptions` / `prices` の prop | `CartOptionType` の値、`getPrices` の戻り |
| `lib/firebase/functions.ts` | `superDispatch` の戻り | 後述 |
| `super/AdminInfo.vue` | `data.result` の読みと `adminId` | 同上 |

## `superDispatch` の戻りを `unknown` と宣言した理由

`functions/src/functions/super/super.ts` の dispatcher は cmd ごとに違うものを返す。
`getCustomeClaims` と `setCustomClaim` は `{ result: <claims> }` を返すが、
**`setCustomClaim` は対象が operator でないか相手にメールが無いと、初期値の
`{ result: false, message: "not processed" }` をそのまま返す**（知らない cmd のほうは
`HttpsError` を投げるので戻りにはならない）。1つの形には決められないので
`{ result: unknown }` と正直に宣言し、**読む側で絞る**ことにした。

`AdminInfo.vue` は `claimsOf` で絞る。画面が読むのは `admin` と `operator` の2つだけで、
オブジェクトでないものを空として扱えば同じ結果になる（下記）。

`adminId` は `route.params` なので型の上では配列にもなりうる。この経路は繰り返し指定では
ないので常に文字列だが、`String()` を通して宣言でもそう言うようにした。

## 同じ振る舞いであることの確かめ方

**読んで判断していない。** 旧と新を並べて走らせた。

`claimsOf` — 権限あり / operator だけ / 空 / **知らない cmd の戻り `false`** / `null` /
`undefined` / 文字列 / 数値 / 配列。画面が読む `admin` と `operator` の2つを突き合わせた。
**差が出たのは `null` と `undefined` だけ**で、そこは旧が例外になっていた。
`false` でも一致する。

`String(adminId)` — 文字列と空文字では恒等。配列では変わるが、この経路では起きない。

## 型を付けて表に出たこと

`Menu.vue` の `selectedOptions` に型を付けると、`unknown` だった3件が**具体的な2件**に
変わった。どちらも不具合ではなく型の粗さ。

- `selectedOptions[quantityKey][index]` は checkbox では真偽値、radio では文字列。
  同じ枠なので型は `boolean | string` の union になり、checkbox の枝だけが真偽値を
  受けることを型が追えない
- prop が `required: false` なので、添字を引く前に守りが要ると言われる

どちらも「読めない」から「何が足りないか」に変わったので、そのまま残す。
