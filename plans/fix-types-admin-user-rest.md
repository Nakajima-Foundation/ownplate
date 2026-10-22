# Firestore の読み込みに型を付ける（3: 管理画面・お客様の画面の残り）

## やること

- モデルを足す。
  - `src/models/subAccount.ts`: お知らせ（`admins/:uid/messages`）、サブアカウント（`admins/:uid/children`）。functions の `subAccount.ts` が書く。
  - `src/models/lineUser.ts`: LINE の利用者（`restaurants/:id/lineUsersData`）。functions の `line.ts` が書く。
- `ReviewData` に、お気に入りボタン（`FavoriteButton.vue`）が書いている `restaurantId` と `timeLiked` を足す。
- 型を当てる所:
  - 管理トップのお知らせ
  - サブアカウントの一覧・詳細
  - `MessageCard` の props（これまで `type: Object`）
  - お客様のトップとお気に入り一覧
  - メニューの見出し（`TitleData`）
  - LINE の利用者
  - 値引きの履歴（`UserPromotionHistoryDataBase` を読む形にした型。`as` をやめた）
  - LIFF の店舗一覧
- 型を付けて出た型エラー2件は、型を広げて直した（コードは変えない）。
  - サブアカウントの `rList`: もともと `|| []` で無い場合を受けていたので、引数を `string[] | undefined` にする。
  - サブアカウント詳細の `name`: 実際に `undefined` が入るので、`string | undefined` にする。

## 実行時の動き

- 値と分岐は変えない。
- お知らせ・サブアカウント・お気に入り・見出しの分は、ビルド結果（`dist`）が前の PR と同じ。
- LINE の利用者・値引きの履歴・LIFF の店舗一覧は、`collectionData`（引数をそのまま返す関数）の呼び出しが増える。
  - 項目がそろった型に `DocumentData` を入れるのと、値引きの履歴の `as` の代わり。

## やらないこと

- アクセス解析（`Analytics/Index.vue`、`pageViewData`）。書き手がこのリポジトリに無く、形を確かめられない。
- `RestaurantUtils.ts` の `as`。単体テストから読むファイルで、`collectionData` のために `utils/utils.ts` を読むと Firebase ごと読み込むことになる。
- super 画面は次の PR。
