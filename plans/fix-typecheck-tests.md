# test/ を型検査する

omochikaeri-docs#182

## 何を直すか

`tsconfig.json` の `include` は `tests/**/*.ts` だが、実体のディレクトリは **`test/`**。綴りが
違うので、ユニットテストは一行も型検査されていない。`yarn lint` も `eslint src` なので届かない。

実害が出ている: `getEditShopInfo` を引数1つで呼ぶテストが緑のまま通っていた。この関数は第2引数
`now` が必須で、渡さないと `updatedAt: undefined` / `createdAt: undefined` という、**どの呼び出し元も
作らない形**を検証していたことになる。

## `include` に足すだけでは直らない

`test/**/*.ts` を足すと `TS5097` が出る。node の型剥がし（`node --test` で `.ts` を直接走らせる
構成）は `.ts` 付きの import を**要求する**のに、アプリ側の tsconfig は `allowImportingTsExtensions`
を持たない。アプリのビルド設定でこれを有効にするのは違う。

## やること

- `tsconfig.test.json` を追加する。`extends` + `allowImportingTsExtensions` + `noEmit` +
  `types: ["node"]`（アプリ側の `types` は `vite/client` と `gtag.js` だけなので `node:test` が引けない）
- `typecheck:test` スクリプトを追加し、**CI の `build-vue` に入れる**。CI に入れないとゲートが本物に
  ならない
- `tsconfig.json` から死んだ `tests/**` の include を消す。残すと「テストも見ている」と読める
- fixture を型に合わせる。`test/fixtures/restaurantInfo.ts` に `RestaurantInfoData` を満たす店舗を
  1つ置き、テストは必要な項目だけ上書きする

## fixture を型に合わせて分かったこと

これまでの fixture は項目を11個しか持たない素のオブジェクトだった。型に合わせると、
「新規の店舗は `createdAt` を持たない」ことを**明示的に書く必要**が出る（`defaultShopInfo` に無い）。
以前はそれが暗黙だったので、テストが何を覆っているのか読めなかった。

## 確認

- 変異: 第2引数を落とす（実際に出荷された形）→ `typecheck:test` が赤、**`yarn test` は緑のまま**
- 変異: fixture の必須項目を落とす → `typecheck:test` が赤
- `yarn lint` / `yarn test` / `yarn build` / `typecheck:test`

## やらないこと

- `eslint` の対象に `test/` を足すのは別の話（型検査とは別のゲート）
- `RestaurantInfoData.createdAt` は `Date` と宣言されているが、Firestore の実体は Timestamp
  （`AllRestaurants.vue` が `createdAt.toDate()` を呼んでいる）。この不一致は別途
