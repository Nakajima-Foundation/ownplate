# fix: デプロイ後に古い画面が消えた分割ファイルを読んで落ちる

## 症状

管理画面を開きっぱなしのタブレットで、デプロイ後に画面を切り替えると
`TypeError: Failed to fetch dynamically imported module: .../assets/OrderInfoPage-<hash>.js`
で落ちる（Sentry、admin-order-info）。古いビルドが参照する分割ファイルは、新しいデプロイで消えている。

## 方針

- `vite:preloadError`（Vite 8 は分割ファイル本体の `import()` 失敗でも発火する）で受け取ったエラーを覚える。
- `router.onError` で同じエラーオブジェクトが来たときだけ、移動先 (`to.fullPath`) を読み込み直す。
  ブラウザごとに違うエラー文には頼らない。
- 読み込み直しが続かないよう、直前の読み込み直しから一定時間内なら何もしない（エラーはそのまま Sentry に届く）。
  直前の時刻は sessionStorage に置く。書き込めない環境では読み込み直さない（無限に読み込み直すより、今までどおり落ちる方がよい）。

判定は `src/utils/staleChunkReload.ts` の純粋関数にして試験する。

## 対象外

- ルート以外の動的 import（ボタン押下で読むものなど）の失敗。今回の Sentry は画面遷移のみ。
