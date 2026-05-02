# B-MED-3: News markdown — explicit `html: false`

Issue: #1698
Refs: `omochikaeri-docs/Docs/code_review_vue_2026-04-30.md` B-MED-3

## 問題

`src/app/admin/News/Article.vue` と `src/app/user/News.vue` で

```ts
md: new MarkdownIt(),
```

として、`v-html` でレンダリングしている。

`news.markdown` は `src/app/admin/News/data.ts` にハードコードされた内部コンテンツのため XSS 実害は現状ないが、markdown-it の `html` オプションのデフォルトが `false` であることに依存している。明示的でなく、将来 admin UI から編集可能化された場合に問題化する。

## 修正方針

`new MarkdownIt({ html: false })` を明示。動作変更なし（デフォルト値の明示化）。

## 変更ファイル

- `src/app/admin/News/Article.vue`
- `src/app/user/News.vue`

## 影響範囲

- 機能挙動なし（既にデフォルトで `html: false`）
- 防御的姿勢を可視化
