# mulmoclaude eslint config からの取り込み

## 背景

`~/ss/llm/mulmoclaude/eslint.config.mjs` で使われている lint rule のうち、ownplate 既存ルールに無く、追加してもノイズが少ないものを取り込む。

## 取り込んだルール

新規プラグイン依存なし、ownplate に既存違反が 0 〜 数件で実害があるもののみ:

### built-in
- `no-throw-literal` — `throw "string"` を禁止
- `default-case-last` — switch の default を末尾強制
- `no-self-compare` — `x !== x` 等の自己比較禁止
- `no-unmodified-loop-condition` — 無限ループ検知
- `prefer-arrow-callback` — `function(){}` → アロー関数
- `prefer-object-spread` — `Object.assign({}, x)` → `{...x}`
- `object-shorthand` — `{foo: foo}` → `{foo}`
- `no-multi-assign` — `a = b = c` 禁止
- `no-lonely-if` — `else { if {} }` → `else if {}`
- `no-floating-decimal` — `.5` → `0.5`
- `no-undef-init` — `let x = undefined` 禁止
- `no-loop-func` — ループ内関数生成警告
- `no-new-wrappers` — `new String(...)` 等禁止
- `no-octal-escape`
- `no-proto`
- `no-script-url` — `javascript:` URL 禁止
- `no-useless-call`
- `no-useless-concat`
- `no-useless-rename`
- `prefer-rest-params` — `arguments` → rest
- `prefer-spread` — `apply` → spread
- `prefer-promise-reject-errors`
- `prefer-regex-literals` — `new RegExp(string)` → `/.../`
- `prefer-numeric-literals` — `parseInt("11", 2)` → `0b11`
- `radix` — `parseInt(x)` → `parseInt(x, 10)`
- `no-return-assign`
- `no-new` — `new Foo()` の捨て呼び禁止

### typescript-eslint
- `@typescript-eslint/no-non-null-assertion` — `foo!` 禁止
- `@typescript-eslint/method-signature-style` — interface method を property style に統一
- `@typescript-eslint/no-require-imports` — `require()` 禁止

### vue
- `vue/no-useless-mustaches`
- `vue/no-useless-v-bind`
- `vue/no-empty-component-block`

## 取り込み見送ったルール（理由付き）

| Rule | 違反数 | 理由 |
|---|---|---|
| `arrow-body-style: as-needed` | 457 | 大規模整形、別 PR |
| `prefer-template` | 135 | 同上 |
| `vue/prefer-true-attribute-shorthand` | 18 | auto-fix 不可、別 PR で手作業 |
| `@typescript-eslint/no-dynamic-delete` | 1 | local object の `delete` で正当用途、disable コメント増えるだけ |
| 各種プラグイン (`sonarjs`, `security`, `import`, `prettier`) | - | 大量追加で初動コスト高、別途検討 |
| `id-length`, `complexity`, `max-depth`, `max-params` | - | ownplate のコードベース規模感に合わない |

## 既存違反の修正

| File | 違反 | 対応 |
|---|---|---|
| `src/app/admin/Restaurants/OrderInfoPage.vue:755` | `no-self-compare` (`x !== x` の NaN チェック) | `Number.isNaN()` に置換 |
| `src/components/CustomerInfo.vue:106,111` | `no-new` (Google Maps `new AdvancedMarkerElement`) | `// eslint-disable-next-line no-new` + 理由コメント |
| `src/utils/admin/RestaurantPageUtils.ts:196` | `prefer-regex-literals` | `new RegExp("...")` → `/.../` |
| `src/utils/pickup.ts:283` | `@typescript-eslint/no-non-null-assertion` (`menu.id!`) | `key` 変数に置換（同じ値） |

## auto-fix で機械的に修正された箇所

`prefer-object-spread` / `prefer-arrow-callback` / `object-shorthand` / `vue/no-useless-v-bind` / `vue/no-useless-mustaches` 等が `eslint --fix` で自動修正。`yarn format` を後に流して整形を揃え。

影響ファイル: 35 ファイル, 計 91 insertions / 68 deletions

## 検証

- `yarn lint` 通過
- `yarn build` 通過
- ランタイム挙動変更なし (純文法整形のみ + 4 箇所の意味ある修正)
