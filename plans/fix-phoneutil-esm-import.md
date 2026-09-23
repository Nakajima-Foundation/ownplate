# phoneutil の named import を ESM で読める形にする

omochikaeri-docs#194

## 何が問題か

`src/utils/phoneutil.ts` が CommonJS の `google-libphonenumber` から名前付き import をしている。
リポジトリ直下は `"type": "module"` なので、node の ESM 側はこのパッケージの名前を静的に読めず落ちる。

画面は壊れていない（vite が CommonJS を事前に束ねる）。壊れているのは node から読めないことで、
そのぶん単体試験が書けない。`src/` の ts を node で読ませると、詰まる17本のうち12本がこの1本に起因していた。

## 直す範囲

このファイルだけ。既定 import から `PhoneNumberUtil` と `PhoneNumberFormat` を取り出し、
型でしか使っていない `PhoneNumber` はインラインの型修飾子に寄せる。

型 import を別の文に分けると vite build 内の eslint が `no-duplicate-imports` で弾くので、1文にまとめる。

## 確かめ方

このファイルは `scripts/copy2functions.sh` で `functions/` 配下へコピーされ、あちらは `tsc` で JavaScript に変換する。
**両側を通す**:

- 直下: `yarn typecheck:test` / `yarn test` / `yarn build`
- `functions/` 配下: `sh scripts/copy2functions.sh` のあと `yarn build` と `tests/unit/phoneutil_test.ts`
- node から実際に電話番号を整形させて、値が変わらないこと

`yarn typecheck:test` だけでは足りない。eslint は vite build の中で走るため。

## やらないこと

`import.meta.env` を使っているファイル（`firebase9.ts` ほか）には触れない。あちらが node から読めないのは
ESM の問題ではなく、読み込み時に Firebase を初期化しているため。試験が Firebase を初期化するのは
そもそも直す方向ではない。
