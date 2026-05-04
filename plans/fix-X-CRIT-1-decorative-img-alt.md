# X-CRIT-1 (partial): 装飾画像に `alt=""` 追加

Refs: `omochikaeri-docs/Docs/code_review_vue_2026-04-30.md` X-CRIT-1

## 問題

レビューで明示された 3 箇所の `<img>` に `alt` 属性なし。スクリーンリーダーが画像ファイル名を読み上げる（例: "LP-UserVoice-Face-1.jpg"）。

- `src/components/lp/aboutService.vue:27` — Profile 写真 (中島聡氏)、隣に氏名・肩書テキスト
- `src/components/lp/userVoices.vue:13` — お客様の声、隣に氏名・店名テキスト
- `src/components/lp/userVoices.vue:39` — YouTube 動画サムネ、リンク内に「動画を見る」テキストあり

## 修正方針

3 件とも装飾的（情報は隣接テキストで完結）なので `alt=""` を明示。SR は要素自体をスキップする。

## 副作用

- 視覚的変更ゼロ
- 機能挙動変更ゼロ
- SR 利用者の体験のみ向上（ファイル名読み上げ → スキップ）

## 残作業

`<img>` で `alt` 無しは全コードベースで **86 件**ある。残り 83 件は:
- 装飾的なもの (logo、partner ロゴ等) → `alt=""`
- 内容を伝える必要があるもの (商品写真、店舗カバー画像等) → 動的 alt 設定が必要

判断にコストがかかるため別 PR に分離。
