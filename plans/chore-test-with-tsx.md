# 直下の単体試験を tsx で走らせる

omochikaeri-docs#195

## 何が問題か

`functions/` 配下は既に `node --import tsx --test` で走っているが、直下だけ素の `node --test` のまま。
素の node は値の import に拡張子を要求するので、拡張子なしで書かれた `src/models/` を読めない。

そのせいで `src/models/` の純粋な関数が1つも試験できていない。

| 読めないファイル | 詰まる先 | 中にある純粋な関数 |
| --- | --- | --- |
| `src/models/menu.ts` | `./firebaseUtils` | `getNewItemData` / `isAvailableLunchOrDinner` / `onlyLunchOrDinner` |
| `src/models/menuUtils.ts` | `./menu` | `copyMenuData` / `getBlankMenuItem` / `getBlankTitleItem` |

## 拡張子を足す手は使えない

`.ts` を足すと `functions/` 配下の変換が落ちる:

```
error TS5097: An import path can only end with a '.ts' extension when
'allowImportingTsExtensions' is enabled.
```

`allowImportingTsExtensions` は `noEmit` とセットでしか使えず、`functions/` 配下は `lib/` に
JavaScript を吐く必要があるので有効にできない。`scripts/copy2functions.sh` でコピーされる
10本すべてが同じ制約下にある。直下の型検査と vite のビルドは通ってしまうので、直下だけ
見ていると気づけない。

（`.js` を足す手は両立する。ただし素の node は `.js` を `.ts` に読み替えないので、
どちらにせよ tsx が要る。`.js` への統一は別の作業。）

## 直す範囲

走らせ方だけ。実装には触らない。

- `tsx` を開発時の依存として入れる
- `test` を `node --import tsx --test test/unit/test_*.ts` にする

## 確かめ方

- 既存の試験がそのまま通ること
- `src/models/menu.ts` を読む試験を足し、**tsx を外すと `ERR_MODULE_NOT_FOUND` で落ちる**ことを確かめる
  （切り替えが効いている証明。足した試験が素の node でも通るなら、tsx は何もしていない）
- 足した試験が、規則を壊したときに赤くなること

## やらないこと

`src/utils/utils.ts`（カート金額の計算）は tsx でも読めない。`src/lib/firebase/firebase9.ts` が
読み込んだ瞬間に `initializeApp` と `initializeAppCheck` を呼び、`location` / `self` を使うため。
試験が Firebase を初期化するのはそもそも直す方向ではないので、あちらは純粋な関数を
別ファイルへ切り出す別の作業になる。
