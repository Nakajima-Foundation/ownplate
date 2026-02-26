# メニューCSVエクスポート機能 - 実装ガイド

## プロジェクト概要
飲食店からの要望が多いメニューのCSVエクスポート機能を実装します。
ボランティアベースのプロジェクトのため、シンプルでメンテナブル、セキュアな実装を心がけます。

## 実装フェーズ
Phase 1: エクスポート機能のみ（今回実装）
Phase 2: インポート機能（将来実装予定）

---

## Phase 1: メニューCSVエクスポート機能

### 機能要件
- 管理画面のメニュー一覧ページにCSVエクスポートボタンを追加
- すべてのメニューアイテム（公開/非公開、有効/無効含む）をエクスポート
- カテゴリタイトルも含めてエクスポート
- 日本語のファイル名とヘッダー（多言語化は将来検討）

### 技術調査結果

#### メニューデータ構造
**Firestoreコレクション:**
- メニュー: `restaurants/{restaurantId}/menus`
- カテゴリタイトル: `restaurants/{restaurantId}/titles`

**TypeScript型定義:** `src/models/menu.ts`
- `MenuData`: メニューアイテムの型
- `TitleData`: カテゴリタイトルの型

**主要フィールド (MenuData):**
- `itemName`: メニュー名
- `itemDescription`: 説明
- `price`: 価格
- `tax`: 税区分
- `publicFlag`: 公開フラグ
- `soldOut`: 売り切れフラグ
- `category1`, `category2`: カテゴリ
- `allergens`: アレルゲン情報
- `availableLunch`, `availableDinner`: ランチ/ディナー提供可否

#### 既存の類似機能
**PDFダウンロード機能:**
- ファイル: `src/app/admin/Restaurants/MenuListPage/DownloadButton.vue`
- 既にメニューリストにダウンロードボタンが実装済み
- `src/lib/pdf/pdf.ts`でPDF生成ロジック

### 実装計画（PRごとに分割）

#### PR #1: CSV生成ユーティリティの作成
**ファイル:**
- 新規: `src/utils/csv/menuExport.ts`

**実装内容:**
- CSVヘッダー定義（日本語）
- MenuData/TitleDataからCSV行への変換関数
- CSV文字列生成関数
- エスケープ処理（カンマ、改行、ダブルクォート）

**セキュリティ考慮:**
- CSVインジェクション対策（=, +, -, @で始まるセルに'を追加）
- 特殊文字のエスケープ

**テスト項目:**
- 基本的なメニューデータのCSV変換
- 特殊文字を含むデータのエスケープ
- カテゴリタイトルの処理
- 空データの処理

#### PR #2: CSVエクスポートボタンの追加
**ファイル:**
- 新規: `src/app/admin/Restaurants/MenuListPage/ExportCsvButton.vue`
- 変更: `src/app/admin/Restaurants/MenuListPage.vue`

**実装内容:**
- ExportCsvButtonコンポーネントの作成
  - DownloadButton.vueを参考にしたUI
  - menuObjとshopInfoをpropsで受け取る
  - クリックでCSVダウンロード
- MenuListPage.vueにボタンを配置
  - DownloadButtonの隣に配置

**UIテキスト:**
- i18n追加: `button.exportCsv` (日本語: "CSVエクスポート")
- アイコン: Material Icons `download` または `table_view`

#### PR #3: 多言語対応とドキュメント
**ファイル:**
- 変更: `src/locales/*.json`
- 新規: ユーザー向けドキュメント（必要に応じて）

**実装内容:**
- 英語、スペイン語、フランス語のi18n追加
- 必要に応じて機能説明ドキュメント

### CSVフォーマット仕様

**ヘッダー行（案）:**
```
タイプ,名前,説明,価格,税区分,公開,売り切れ,カテゴリ1,カテゴリ2,ランチ,ディナー,アレルゲン,メモ
```

**データ行（メニュー）:**
```
メニュー,ハンバーグ定食,ジューシーなハンバーグ,1200,food,公開,在庫あり,定食,肉料理,○,○,"卵,乳",特製ソース
```

**データ行（カテゴリタイトル）:**
```
カテゴリ,定食,,,,,,,,,,,
```

### 開発環境

**フロントエンド:**
```bash
yarn start  # 開発サーバー起動（ポート3000）
```

**リント/フォーマット:**
```bash
yarn lint
yarn format
```

### コードレビューポイント
- CSVインジェクション対策が適切か
- エスケープ処理が正しく実装されているか
- 既存コードとの整合性
- TypeScript型の適切な使用
- エラーハンドリング
- ユーザーフィードバック（ローディング状態など）

### 注意事項
- 画像データはエクスポート対象外（URLのみ含める場合は検討）
- 大量のメニューデータでのパフォーマンス考慮
- ブラウザの互換性（File API使用）
- ファイル名に日本語を使う場合の文字コード

### 将来の拡張（Phase 2）
- CSVインポート機能
- エクスポート対象フィールドのカスタマイズ
- Excel形式のサポート
- 一括編集機能

---

## 技術スタック参考
- Vue 3 + TypeScript
- Composition API
- Firebase Firestore
- i18n
- Oruga + Bulma (UIコンポーネント)

## 関連ファイル参照
- メニューモデル: `src/models/menu.ts`
- メニュー一覧: `src/app/admin/Restaurants/MenuListPage.vue`
- PDF生成例: `src/lib/pdf/pdf.ts`
- composables: `src/app/admin/Restaurants/MenuListPage/Utils.ts`