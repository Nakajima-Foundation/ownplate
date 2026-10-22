# 店舗情報の入力検証が返す型を、実態に合わせる

## 何が起きていたか

`shopInfoValidator` は「欄の名前 → 文句の一覧」を返す。ただし `time` だけは曜日と枠で
入れ子になっている。それを

```ts
type shopInfoValidatorError = {
  [key: string]: string[] | ShopInfoBussinessTimeError;
};
```

と**ひとまとめの union** で宣言していた。すると画面側が

```
{{ $t(errors["restProfilePhoto"][0]) }}
```

と読んだとき、「`string[] | ShopInfoBussinessTimeError` は `0` で添字できない」となる。
`vue-tsc` の誤り24件がこれ。

## 直し方

**`time` だけを別に宣言する。**

```ts
type shopInfoValidatorError = { [key: string]: string[] } & {
  time?: ShopInfoBussinessTimeError;
};
```

欄の名前は文字列の一覧、`time` は入れ子、と分かれるので、画面側の添字が通る。

## 測ったこと

|                      | 前  | 後   |
| -------------------- | --- | ---- |
| `vue-tsc` 全体       | 486 | 462  |
| 誤りが増えたファイル | —   | なし |

型の宣言だけなので、出力される JavaScript は変わらない。

## `time` を必須にしなかった理由

必須（`time:`）にすると誤りは 486 → 457 まで落ちるが、`shopInfoForm.ts` 自身に1件増える
（`const err: shopInfoValidatorError = {}` の時点では `time` がまだ無い）。それを消すには
`err` の組み立て方を変えることになり、実行時の変更が入る。

**任意にすれば型だけで済み、増加はゼロ。** 24件と29件の差より、実行時に触らないほうを採った。
