# SEO・AI 検索向け（1）: robots.txt / llms.txt / lang / canonical（#2068）

## やること

- `robots.txt` と `llms.txt` を functions（`apiJP2`）から返す。`firebase.json` の rewrites に足す。
  - 本番（`omochikaeri.com` / `ownplate.today`）:
    - robots.txt: 管理画面（`/admin`・`/s/`・`/op`）、利用者のページ（`/u/`）、注文ページ（`/r/*/order/`）だけを拒み、sitemap を示す。AI のクローラーも `*` に従う（読んでよい）。
    - llms.txt: サービスの説明と、主なページへのリンク。
  - staging（`staging.ownplate.today`）: robots.txt はすべてを拒む。llms.txt は 404。静的ファイルにしないのは、staging にも同じものが配られるため。
  - 中身の組み立ては `functions/src/lib/seo.ts` の純粋な関数（単体テスト `seo_test.ts`）。
- `index.html` を `<html lang="ja">` にする。JS を実行しないクローラーと、functions の OGP ページ（`index.html` がひな形）が `en` になっていた。画面側は JS が動いたあと `htmlAttrs.lang` で言語を切り替える（これまでどおり）。
- お店・メニュー・オーナーの OGP ページに `<link rel="canonical">` を足す（`og:url` と同じ URL）。

## 決めたこと（2026-09-28）

- 言語は基本日本語。robots.txt で拒むのは上の通り。AI のクローラーにも読ませる。
- `/s` を丸ごと拒むと `/sitemap.xml` まで拒むので、スーパー管理画面は `/s/` で拒む。

## やらないこと（次の PR）

- お店・メニューのページの JSON-LD と、JS を実行しないクローラー向けの本文
- sitemap を広げる
