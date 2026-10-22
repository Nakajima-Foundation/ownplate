# CI のテストカバレッジをジョブ概要に棒グラフで出す

Issue: #1854

## なぜ

`build-vue` はカバレッジを測っているが、表はステップのログの奥にしか出ない。
`build-functions` は測っていない。実行結果の画面を開いたときに見えるようにする。

## やり方

- `node --test` にレポーターを二つ付ける。画面には今まで通り `spec`、ファイルには `lcov`。
  閾値チェック（`--test-coverage-lines` 等）はそのまま効く
- `scripts/lcovSummary.ts` — lcov を読んで集計し、Markdown を組み立てる純粋な関数
- `scripts/coverage-summary.ts` — lcov を読み、`$GITHUB_STEP_SUMMARY` に追記する（無ければ標準出力）
- 見た目: 合計を行・分岐・関数ごとに `🟢 95.10% ██████████` の棒で出し、ファイル別は
  `<details>` に畳んで低い順に並べる
- functions 側は閾値なし・表示のみ（`unit_tests:coverage` を足し、CI をそちらに切り替える）
- 集計スクリプトは Node 24 の型除去でそのまま動かす。functions のジョブはルートの依存を入れないため

## 外部サービスを使わない理由

Codecov や PR コメント用の action は、トークンや書き込み権限が増える。ジョブ概要は追加の権限が要らない。

## 確かめ方

`yarn test` が緑。`yarn test:coverage` を手元で走らせ、出力された lcov から Markdown を作って目で見る。
