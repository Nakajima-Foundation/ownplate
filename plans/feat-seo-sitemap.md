# sitemap.xml を広げる（#2068 の 3）

## 目的

お店のページだけだった sitemap に、トップ・エリア別の一覧・メニューのページを足し、検索に見つけてもらいやすくする。

## やること

- `functions/src/lib/sitemap.ts`（Firebase を触らない純粋関数）で URL の一覧を組み立てる
  - お店に依らないページ: `/`・`/r`・`/r/area/all`・`/faq`・`/news`・`/terms/user`・`/privacy`（`lastmod` なし）
  - エリア: 一覧に載っている（`onTheList`）お店が 1 軒でもある都道府県だけ。`/r/area/:areaId` は `regionalSetting.AddressStates` の添字
  - お店: これまでどおり（公開・削除されていない店）
  - メニュー: 公開しているお店の、お客様の画面に出るメニュー（`isPublicMenu`）
  - sitemaps.org の上限（`MAX_SITEMAP_URLS`）を超えるときは、お店に依らないページ・エリア・お店・メニューの順に残す
- `sitemap_response` をこれに差し替え、1 時間キャッシュする（お店ごとにメニューを読むため）

## 範囲外

- `hidePrivacy`（noindex）のお店を sitemap から外すかどうか（これまでどおり載る）
