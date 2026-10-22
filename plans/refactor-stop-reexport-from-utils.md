# utils.ts の再輸出をやめる

omochikaeri-docs#198

## 何が問題か

`src/utils/utils.ts` が、自分では定義していない `isNull` / `isEmpty` / `regionalSetting` を
そのまま出していた。正本は `src/utils/commonUtils.ts` と `src/config/constant.ts`。

`utils.ts` は先頭で `src/lib/firebase/firebase9.ts` を読むので、そこから1つでも import した
ファイルは読み込んだ時点で Firebase を初期化する。`isNull` を使いたいだけのファイルが
その費用を払っていた。

## 直した範囲

21ファイルの import を正本へ付け替え、`utils.ts` から `export { ... }` を削除した。
再輸出のためだけに取り込んでいた `isEmpty` も import から外した。

**値は同じものを別の道から取るだけ。** 付け替え漏れは型検査とビルドが落ちて教える
（export を消せば未定義の import になる）ので、黙って壊れる形ではない。

## 消さなかった再輸出

`src/models/firebaseUtils.ts` は `firebase/firestore` から型をそのまま出しているが、これは継ぎ目。
`copy2functions.sh` でコピーされる `menu.ts` などが `"./firebaseUtils"` を拡張子なしで指すので、
同じ import 文がコピー先では `firebase-admin` から型を出す
`functions/src/models/firebaseUtils.ts` に解決される。理由が `functions/` 配下にしか
書かれていなかったので、`src/` 側にも残した。

## 何が開いたか

`utils.ts` への import が丸ごと消えたのは4ファイル。うち3つは残る import が
`@/config/constant` と `@/utils/commonUtils` だけになり、Firebase から切れた。

`TimeToPickup.vue` は `@/utils/pickup` と `@/models/orderInfo` 経由でまだ届く。
そこは omochikaeri-docs#197 の範囲。

## 確かめ方

- `yarn typecheck:test` / `yarn lint` / `yarn test` / `yarn build`
- 付け替えたファイルで、他の import が変わっていないこと
