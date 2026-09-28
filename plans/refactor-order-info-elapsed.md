# 注文詳細の「連続した注文」の判定を Timestamp のまま行う（#1981 の最後）

## なぜ

`OrderInfoPage.vue` は `Number(Timestamp)` で時刻を引いていた。`Timestamp.valueOf()` が返す文字列を数にしているだけで、計算は合っているが読んで分からない。判定は画面の中にあり、試験が無かった。

## やること

- 判定を `src/utils/continuousOrder.ts` の `isContinuousOrder` に切り出す。`toMillis()` で引き、同じ時刻は `isEqual` で見る。
- `orderUpdateInterval` は `isWarningOrder` の中の到達しない分岐（`NaN` は `< 4` を満たさない）でしか使われていないので消す。
- 単体テストで両側（出る・出ない・境目・片方が無い）を固定する。
- e2e に「前の注文から 4 時間以上空いていれば出ない」を足す。

## 挙動の比較

変更前の3つの computed を写して生成した入力で並べる。違いが出るのは、2つの時刻の差が 10µs 未満のときだけ（変更前は `Number` の精度切れで「同じ時刻」と見なしていた）。
