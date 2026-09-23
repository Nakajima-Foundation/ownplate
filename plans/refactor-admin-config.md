# 管理画面の切り替え設定を Firebase から切り離して試験を足す

SingularitySociety/omochikaeri-docs#211

## 何をしたか

`src/utils/admin/Toggle.ts` は先頭で Firebase を読み込むので、中の純粋な規則に単体試験が
書けなかった。純粋なのは3つ。

- 設定の置き場 `adminConfigs/<uid>`
- 店舗ごとの置き場 `adminConfigs/<uid>/restaurants/<restaurantId>`
- 保存されていなければ既定値（2つの composable に同じものが書かれていた）

これを `src/utils/admin/adminConfig.ts` に切り出し、`Toggle.ts` はそれを呼ぶ。
composable の中身（`ref(true)` で始まること、書き込む値、`watch` の条件）は触っていない。

## 挙動が同じであることの確かめ方

**読んで確かめてはいない。旧の式をそのまま写して、新しい関数と並べて走らせた。**

uid と店舗 id（空・スラッシュ入り・`..`・全角）、設定の鍵（`__proto__`・`constructor`・
`toString` を含む）、保存された値（真偽・0・空文字・NaN・null・未設定・prototype 側）、
既定値を総当たりで振った。**`data()` が作れる形では違いは出なかった。**

直した行を一つずつ壊して harness が違いを出せることも確かめた。7通りすべてで差が出て、
戻すとゼロに戻った。足した試験も同じ7通りで壊し、すべて赤くなった。

### ひとつだけ違いが出る入力があり、それは到達しない

旧の式は同じ鍵を**2回読む**（`config[key] === undefined ? defaultValue : config[key]`）。
切り出した関数は1回だけ読む。**読むたび答えが変わる値**なら差が出る。

Firestore の `data()` が何を作るかを SDK の実物で確かめた
（`@firebase/firestore` の `convertObjectMap`）。`const n = {}` に `n[e] = ...` で
詰めた**素のオブジェクト**を返すので、getter も proxy も無い。この入力は作れない。

harness にはその形もわざと入れてあり、そこだけ2件の差が出る。**差が出ることが、
harness がこの種類の違いを見られる証拠**になっている。

## 直さないが留めたこと

- **設定の名前は素のまま添字で引いている。** `toString` のような名前で設定を足すと、
  切り替えの値が関数になる。いま使っている3つの名前は当たらない
- **`useAdminConfigToggle` は `ref(true)` で始まる。** 既定値が `false` でも、最初の
  snapshot が届くまでは `true`

どちらも切り出す前からそうで、挙動を変えることになるのでここでは触らない。
試験では**いまの振る舞いのほう**を留めた。

## 確かめていないこと

管理画面を開いて切り替えを操作してはいない。`yarn build` が通ることで、4つの呼び出し元
（`admin/Index.vue`・`OrderListPage.vue`・`MenuItemPage.vue`・`MenuListPage.vue`）から
解決できることまでは見た。呼び出し元の import は書き換えていない。
