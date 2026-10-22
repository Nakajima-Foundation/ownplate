# setup の中の `return;` が、その画面の値を template から見えなくする

## 何が起きていたか

`setup()` の中に **裸の `return;`** があると、setup の戻り型が `undefined` との
union になる。すると Vue の型の組み立てがその画面の値を一つも解決できず、
**template から読んでいる名前が全部「存在しない」と言われる**。

該当は2箇所だけだった（`.vue` を全部走査して、入れ子の関数の中の `return` は除いて数えた）。

| 場所 | なぜ打ち切るか |
| --- | --- |
| `src/components/App.vue` | LINE の中から開かれたので、外部ブラウザへ飛ばす |
| `src/app/admin/Index.vue` | 管理者の権限が無いので、サインイン画面へ飛ばす |

どちらも**飛ばしたあと、この画面の監視やタイマーを仕掛けないための打ち切り**。
早期return自体は残す。

## 変えたこと

`src/utils/utils.ts` に `redirectedResponse`（空のオブジェクト）を足し、
2箇所の `return;` をそれに変えた。`notFoundResponse` と同じ族の道具。

## 同じ振る舞いであることの確かめ方

**読んで判断していない。** Vue の実装を読み、そのうえで本物の Vue で並べて走らせた。

`@vue/runtime-core` の `handleSetupResult` は、`undefined` なら `setupState` を
`EMPTY_OBJ` のまま残し、オブジェクトなら空の proxy を入れる。**どちらも束縛はゼロ。**

本物の Vue（`createSSRApp` + `renderToString`）で、打ち切る場合と打ち切らない場合の
両方について `return;` と `return {}` を並べ、**描き出された HTML と Vue の警告まで
突き合わせた。差は出なかった。** 打ち切った側はどちらも
`<div>undefined/undefined</div>` を描き、同じ警告を2つ出す。

harness は効きを確かめてある。条件を変えた組どうしは違う結果になる。
最初に書いた版は入口を取り違えて**両方が同じ例外で「一致」していた**ので、
この効き確認が無ければ空振りに気づけなかった。

## 確かめていないこと

画面を開いて、LINE から来た場合と管理者でない場合を実際に踏んでいない。
