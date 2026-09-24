# `ref({})` に形を宣言する

## いまの形

`ref({})` と書くと型は `{}` になるので、そのあと template が読む欄がすべて
「その型に無い」と言われる。2ファイル14件。

- `SignInPage.vue` の `errors` — 欄ごとの文面。`email` と `password` を読む
- `Address.vue` の `customerInfo` — `zip` / `prefecture` / `address` / `name` を読む

## 変えたこと

型引数を足しただけ。

- `errors` — どの欄になるかは `signinErrorField` が決めるので、**そこから型を取る**
  （`Partial<Record<ReturnType<typeof signinErrorField>, string[]>>`）。欄が増えたら
  型が自動で追う
- `customerInfo` — 既にある `CustomerInfo` モデル。書き手は `_doc.data() || {}` で、
  モデルの欄はすべて省略可なので `{}` のままで満たせる

## 出力が変わらないことの確かめ方

**読んで判断していない。** 両ファイルの `<script>` を変更の前後で取り出し、
同じ名前で esbuild に通して**出力を突き合わせた。どちらも完全に一致**した
（105行と43行）。型引数と型の import はどちらも消えるので、実行されるものは同じ。

最初に測ったときは一時ファイル名が出力の変数名に混ざって差が出たので、
名前を揃えて測り直している。
