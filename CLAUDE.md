# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

OwnPlate は飲食店向けのテイクアウト注文サービス。Firebase + Vue + Stripe 構成。

- サービス仕様: [docs/SPEC.md](./docs/SPEC.md)
- ドキュメント索引（日本語）: [docs/README.md](./docs/README.md)

## 技術スタック

- フロント: Vue 3 / Vite / TypeScript / Pinia / vue-router / vue-i18n / TailwindCSS
- バックエンド: Firebase Functions / Express / Firestore
- 決済: Stripe Connect（OAuth で店舗オーナーが自分の Stripe アカウントを連携するマーケットプレイス型）+ PaymentIntent API（注文ごとに各オーナーの Stripe アカウント上で決済）
- 監視: Sentry（フロント・バックエンド両方）
- 通知: Twilio (SMS・電話) / Nodemailer (メール) / LINE (LIFF)
- E2E: Playwright
- パッケージ管理: yarn（ルート・`functions/` 独立）

## 開発セットアップ

```bash
yarn install
cp src/config/default/ownplate-dev.ts src/config/project.ts   # 環境設定のひな形
yarn start                                                     # Vite dev server
```

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

### アカウント種別

本サービスには 2 系統のアカウントがある:

- **管理アカウント**（店舗オーナー向け）: メール + パスワードでサインイン。ロール (super / operator 等) は Firebase Custom Claims で管理。`batch/customclaims.js` や `functions/src/functions/super/` から付与
  - **サブアカウント**: 親管理者（店舗オーナー）が招待して作成する子アカウント。実装は `functions/src/functions/subAccount.ts`
- **ユーザーアカウント**（注文者向け）: **電話番号認証** と **メール認証** の 2 経路。**LINE LIFF** 経由でのログインにも対応

ログイン画面は `src/app/auth/` 配下（`SignInPage.vue` / `PhoneLogin.vue` / `SignUpPage.vue` / `LineCallback.vue` 等）。

### 主要ディレクトリ

`src/`:

- `app/` — ページ。以下のサブディレクトリで構成:
  - `user/` — 注文者向け（店舗ページ・注文画面・注文履歴）
  - `admin/` — 店舗オーナー向け（店舗・メニュー情報編集・注文管理・FAQ・メッセージ）
  - `super/` — スーパー管理者（全管理者・全店舗・全注文・ログ閲覧）
  - `auth/` — サインイン / サインアップ / LINE コールバック / 電話番号認証
  - `liff/` — LINE LIFF 対応エントリ
  - `home/` — ランディングページ (LP)
  - `operator/` — オペレーター画面
  - `common/` — 404・プライバシー・利用規約など
  - `docs/`, `redirect/` — その他
- `components/` — 共通コンポーネント
- `models/` — ドメインモデル
- `store/` — Pinia
- `lang/` — i18n リソース
- `config/` — 環境別設定（`project.ts` は `src/config/default/` から環境ごとにコピー）

`functions/src/`:

- `index.ts` — Cloud Functions の export エントリ
- `functions/` — 関数実装
- `wrappers/` — `functions/` 配下の実装本体を Firebase Functions の API (`onCall` / `onRequest` 等) で包む層。実装を `firebase-functions` 依存から切り離してテスト可能にするため分離されている
- `common/`, `utils/` — `src/` からのコピー先（git 管理下は空。デプロイ時に `src/config/` や `src/utils/` からコピーされる）。直接編集しない
- `models/` — Functions 固有の型定義 (`TestType.ts`, `common.ts`, `firebaseUtils.ts` 等) と、`src/models/` からコピーされるファイルが混在。コピー対象のファイルは直接編集しない（`firebase.json` を参照）
- `smaregi/` — スマレジ連携（廃止予定のためメンテ不要）

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
