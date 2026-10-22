# メニューを保存する形の型を分ける

## なぜ

`getNewItemData`（`src/models/menu.ts`）は `MenuData` を返すと書いてあった。だが実際には、画像が無いとき `images: {}`、除外時間が無いとき `exceptHour: {}` を返す。Firestore は `undefined` を書けないので、空のオブジェクトにしている。`MenuData` の `images` は `item` が必須なので型が合わず、`@ts-expect-error` で隠していた。

## やること

- 保存する形の型 `MenuSaveData` を足す（`images: Partial<MenuImages>`、`exceptHour: ExceptHour`）。
- `getNewItemData` と `copyMenuData` の戻り値をこの型にする。どちらも Firestore へ書く値を作る関数。
- `@ts-expect-error` を消す。

## 実行時の動き

変えない（型だけ）。`main` とこのブランチの `dist` を `diff -rq` で比べて同じ。`menu.ts` は functions へコピーされるが、functions は `getNewItemData` を使っておらず、functions の `yarn build` も通る。
