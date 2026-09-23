# src を見る typecheck を足す

omochikaeri-docs#200

## 何が問題か

`typecheck:test` は名前に反して `tsconfig.test.json`（`include` は `test/**/*.ts`）を見る。
試験が import している src は連鎖で検査されるが、**どの試験からも import されていない src は
素通りする**。

測った結果:

| 壊した場所 | `yarn typecheck` | `yarn typecheck:test` |
| --- | --- | --- |
| `src/utils/optionRows.ts`（試験が import している） | 捕まえる | 捕まえる |
| `src/utils/map.ts`（どの試験も import していない） | **捕まえる** | **素通り** |

## やること

`typecheck` を足して `tsconfig.json`（`src/**`）を見させる。CI の `build-vue` にも足す。

いま `tsc --noEmit -p tsconfig.json` は 0件で通るので、足した時点で緑。

## 新しい覆いではない

`src/` は既に `yarn build` 内の `vite-plugin-checker`（`typescript: true`）が検査している。
得られるのは**折り返しの速さと名前の正確さ**で、ビルドまで行かずに型で落ちるようになる。

## やらないこと

`vue-tsc`（`.vue` の template まで検査するもの）は入れない。いま1105件出るので別の課題。
