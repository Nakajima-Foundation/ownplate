# `ref({})` に形を宣言する（2）

#1877 の続き。書き手をたどって形を確かめきれたものだけを入れる。

| 場所 | 値 | 形の出どころ |
| --- | --- | --- |
| `UserHistory.vue` | `userLog` | `functions/src/functions/order/orderPlace.ts` が書いている欄 |
| `Pay.vue` / `BeforePaid.vue` | `cardState` | `StripeCard.vue` が emit するもの。画面が読むのは `complete` だけ |
| `NotificationSettingButton.vue` | `notificationData` | `Wrapper.vue` が `null` で作り、`NotificationSettings.vue` が保存する欄 |

`userLog` は `counter` / `cancelCounter` / `lastOrder` だけを画面が読む。`lastOrder` は
`.toDate()` を呼んでいるので `Timestamp`。型としてしか使わないので `import type` で取る。

`notificationData` は保存された設定をそのまま受ける。値は `null` にもなるので `boolean | null`。

`cardState` は最初「書き手の注釈をそのまま写す」形にしたが、**その注釈自体が嘘だった**。
`StripeCard.vue` が渡すのは Stripe の実物（オブジェクトや文字列の欄を持つ）か
`{ complete: true }` のどちらかで、`{ [key: string]: boolean }` ではない。画面が読むのは
`complete` だけなので、それだけを約束する形にし、**書き手側の注釈も直した**。

## 出力が変わらないことの確かめ方

**読んで判断していない。** 3ファイルの `<script>` を変更の前後で取り出し、同じ名前で
esbuild に通して**出力を突き合わせた。3つとも完全に一致**した（150行・144行・39行）。
行数も見て、空の出力を掴んでいないことを確かめてある。

## 残した同じ形

まだある。一覧はすぐ古くなるので命令のほうを書く。

```
grep -rn "ref({})" src/ --include="*.vue" --include="*.ts"
```

（`= ref({})` で探すと、引数として渡している `usePickupTime(..., ref({}), ...)` の形を
取りこぼす。編集器の控えファイルも拾わないように `--include` を付ける。）

`BeforePaid.vue` の `$refs.ecCustomerRef` 経由の読みは、子部品への参照を型付ける
別の話なので入れていない。
