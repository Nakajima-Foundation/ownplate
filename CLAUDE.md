# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

OwnPlate は飲食店向けのテイクアウト注文サービス。元々は海外展開も視野に作られたが、現在は国内向けに運用している。Firebase + Vue + Stripe 構成。

- サービス仕様: [docs/SPEC.md](./docs/SPEC.md)
- ドキュメント索引（日本語）: [docs/README.md](./docs/README.md)

## 技術スタック

- フロント: Vue 3 / Vite / TypeScript / Pinia / vue-router / vue-i18n / TailwindCSS
- バックエンド: Firebase Functions / Express / Firestore
- 決済: Stripe Connect（OAuth で店舗オーナーが自分の Stripe アカウントを連携するマーケットプレイス型）+ PaymentIntent API（注文ごとに各オーナーの Stripe アカウント上で決済）
- 監視: Sentry（フロント・バックエンド両方）
- 通知: Twilio (SMS) / Nodemailer (メール) / LINE (LIFF)
- E2E: Playwright
- パッケージ管理: yarn（ルート・`functions/` 独立）

## 開発セットアップ

```bash
yarn install
cp src/config/default/ownplate-dev.ts src/config/project.ts   # 環境設定のひな形
yarn start                                                     # Vite dev server
```

## 環境切り替え

`src/config/project.ts` は環境ごとに差し替える。以下のスクリプトは `firebase use <alias>` と `cp src/config/default/<name>.ts src/config/project.ts` をまとめて行う:

- `yarn use_staging`
- `yarn use_jp`

## ビルド / Lint / テスト

### ルート（フロント）

| コマンド | 用途 |
| --- | --- |
| `yarn start` | Vite dev server |
| `yarn build` | `vite build` + `dist/index.html` を `functions/templates/` へコピー |
| `yarn lint` | `dumpi18n` を走らせてから ESLint |
| `yarn format` | Prettier |
| `yarn test:e2e` | Playwright |
| `yarn test:e2e:ui` | Playwright UI モード |

`yarn lint` は先に i18n キーをダンプする（`@intlify/eslint-plugin-vue-i18n` が参照する）。i18n リソースを変更したら lint を通してから commit する。

### Functions（`functions/` 配下で実行）

| コマンド | 用途 |
| --- | --- |
| `yarn build` | `tsc` |
| `yarn lint` / `yarn format` | ESLint / Prettier |
| `yarn serve` | `firebase serve --only functions` |
| `yarn deploy` | `firebase deploy --only functions` |
| `yarn ci_test` | CI 相当（image / validator / mail_template / svg） |
| `yarn tests` | mocha で全 `tests/*_test.ts` を再帰実行 |

個別 mocha テストは頭文字で呼び分ける: `o_tests`（order）/ `oc_tests`（order_change）/ `n_tests`（notify）/ `t_tests`・`t2_tests`（twilio）/ `s_tests`（subaccount）/ `d_tests`（dl）/ `e_tests`（express）/ `smaregitests` ほか。

単一ファイルを直接叩く例:

```bash
# mocha 系
cd functions
NODE_ENV=test tsx ./node_modules/mocha/bin/mocha tests/order_test.ts --timeout 30000

# node --test 系（i_tests / validator_tests / m_tests / svg_tests と同じ要領）
NODE_ENV=test node --import tsx --test tests/validator_test.ts
```

## アーキテクチャ

### 2 層構成: `src/` と `functions/`

- `src/` — Vue SPA。ビルド成果物の `dist/` が Firebase Hosting にデプロイされる。
- `functions/src/` — Firebase Functions。Express は **OGP 用の HTML ページ返却** と **Stripe 等の外部 API からの callback** 専用。それ以外の機能は Callable Functions や Firestore trigger として実装されている。

`firebase.json` の hosting rewrites により、動的パス（`/r/*`, `/o/*`, `/api/1.0/**`, `/api/2.0/**`, `/smaregi/1.0/**`, `/sitemap.xml` など）は **asia-northeast1 の `apiJP2` 関数** へ流れる。それ以外は `index.html` にフォールバックする SPA ルーティング。

### 共通コードは「import 共有」ではなく「物理コピー」

`src/` と `functions/src/` で共有する TypeScript（モデル・定数・ユーティリティ・電話番号処理など）は、**import 共有ではなく物理コピー** される。コピーは `firebase.json` の `functions.predeploy` フックで functions デプロイ時に自動実行される（コピー対象の正本は `firebase.json` を参照）。

**Claude Code が共通ロジックを編集するときは `src/` 側を直すのが原則**。`functions/src/common/` や `functions/src/models/` を直接編集しても、次回デプロイ時にコピーで上書きされる。

### 主要ディレクトリ

`src/`:

- `app/` — ページ（admin / user / restaurants 等）
- `components/` — 共通コンポーネント
- `models/` — ドメインモデル
- `store/` — Pinia
- `lang/` — i18n リソース
- `config/` — 環境別設定（`project.ts` は上記の「環境切り替え」で差し替え）

`functions/src/`:

- `index.ts` — Cloud Functions の export エントリ
- `functions/` — 関数実装
- `wrappers/` — Express / HTTPS ラッパ
- `common/`, `models/`, `utils/` — `src/` からのコピー（直接編集しない）
- `smaregi/` — スマレジ連携

## ドキュメント

仕様・運用ドキュメントは `docs/` 配下（日本語）:

- [docs/README.md](./docs/README.md) — 索引
- [docs/SPEC.md](./docs/SPEC.md) — サービス仕様
- [docs/DATABASE.md](./docs/DATABASE.md) — Firestore スキーマ
- [docs/NOTIFICATION.md](./docs/NOTIFICATION.md) — LINE / メール / 電話通知
- [docs/ORDER_STATE.md](./docs/ORDER_STATE.md), [docs/STATE_TIME.md](./docs/STATE_TIME.md) — 注文ステート
- [docs/NEWS.md](./docs/NEWS.md) — ChangeLog 仕様（`yarn makenews` で生成）
- [docs/CONFIGURATIONS.md](./docs/CONFIGURATIONS.md) — LIFF / Storage CORS 設定
- [functions/README.md](./functions/README.md) — 注文時に呼ばれる Functions
