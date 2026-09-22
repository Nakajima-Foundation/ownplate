# オプションの金額の取り出しを1つの規則に寄せ、落ちないようにする

omochikaeri-docs#187 の PR A（金額は変えない）

## 背景

注文は選択したオプションを**位置**（`rawOptions`）で保存する。店舗があとからオプションを
並べ替えたり減らしたりすると位置が指す先が変わるので、既存の注文を読み直すときに

- 組そのものが消えている（`itemOptionCheckbox[key]` が `undefined`）
- 組は在るが選択肢が減っている（`opt[index]` が `undefined`）

が起きる。いまはそこで `undefined.split` / `undefined.match` が投げ、店主には「internal」と
しか出ない。金額がずれる話（#187 の本体）は PR B で直す。ここは**落ちなくするだけ**。

## 見つかった重複

オプション文字列から金額を取り出す `optionPrice` が3箇所にあり、同じ正規表現・同じ変換で、
守りが在るのは1つだけだった。

| 場所                             | `(option \|\| "")` |
| -------------------------------- | ------------------ |
| `src/utils/utils.ts:352`         | あり               |
| `src/utils/strings.ts:15`        | なし               |
| `functions/src/lib/utils.ts:170` | なし               |

**2箇所に守りを足すのではなく、1つに寄せる。** 足すだけだと同じ形の穴が残り、次に増えた
コピーでまた同じことが起きる。

寄せ先は `src/utils/commonUtils.ts`。`src/` と `functions/src/` で共有される正本で、
`firebase.json` の predeploy と CI の両方がコピーする。

## 変更するもの

- `src/utils/commonUtils.ts` — `optionPriceRegex` / `convOptionPrice` / `optionPrice` /
  `optionChoicesAt` を置く
- `src/utils/strings.ts` — 自前の複製を消し、`formatOption` は寄せた規則を使う
- `src/utils/utils.ts` — 自前の複製を消す。`getPrices` と `getPostOption` の組の取り出しを
  `optionChoicesAt` にする
- `functions/src/lib/utils.ts` — 自前の複製を消す
- `functions/src/functions/order/orderCreated.ts` — `getOptionPrice` の組の取り出しを
  `optionChoicesAt` にし、`optionPrice` を寄せ先から呼ぶ

## 挙動が変わらないことの確かめ方

金額に触る変更なので、**旧い3つの実装をそのまま写し取った台に載せて、新しい1つと並べて
走らせる**。生成した入力で全件突き合わせ、一致することを数える。

旧い実装が投げていた入力（`undefined` / 範囲外）でだけ結果が変わる。そこは「投げる」から
「0円として扱う」への変更なので、旧い側が投げたことも記録して比べる。

## 確認すること

- 通常の注文の金額が変わらない
- オプションを並べ替えたあとに既存の注文を編集しても落ちない（金額はまだずれる — PR B）
- 選択肢の数が違う組に入れ替えても落ちない
- 買い物かごで会計まで進める

## この PR に入れないもの

`menuItems` の写しを使うようにする本体（#187 の PR B）。金額の計算結果そのものが変わるので、
落ちなくする変更と混ぜると、どちらが金額を動かしたのか分からなくなる。
