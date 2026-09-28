# お店・メニューのページに構造化データと本文を入れる（#2068 の 2）

## 目的

JS を実行しない検索・AI 検索のクローラーにも、お店の名前・住所・営業時間・メニューと値段が読めるようにする。

## やること

- `functions/src/lib/structuredData.ts`（Firebase を触らない純粋関数）
  - Firestore の値を型を確かめながら読む `toRestaurant` / `toMenu`
  - schema.org の JSON-LD: お店は `Restaurant`（住所・位置・営業時間・`hasMenu`）、メニューは `MenuItem`（`offers` と `offeredBy`）
  - 値段は税込（`priceWithTax` を `src/utils/commonUtils.ts` に移して functions と共有）。税の設定か値段が欠けていたら値段は出さない
  - クローラー向けの本文（h1・紹介・住所・電話・営業時間・メニュー）
  - 見えるメニューの条件はお客様の画面と同じ（`deletedFlag == false`・`publicFlag == true`・`validatedFlag` が false でない）。並びは `menuLists`、上限は `MAX_STRUCTURED_MENUS`
- `ogpPage` に組み込む。`hidePrivacy` の店・注文ページ・非公開メニューには入れない。作れなかったときは今までの本文に戻す

## セキュリティ

- 本文の値はすべて `escapeHtml` を通す。本文に入力から作るリンクは置かない
- JSON-LD は `<` `>` `&` U+2028 U+2029 を `\uXXXX` にして、`</script>` や `<!--` で抜けられないようにする
- テンプレートへの差し込みは関数で渡し、店の入力にある `$&` などを置換の記法として読ませない
- 単体テストで、危ない文字を混ぜた生成入力（種は固定）を全フィールドに入れ、組み立て側が書いたタグ以外が残らないことを確かめる

## 範囲外

- サイトマップの拡張（#2068 の 3）
