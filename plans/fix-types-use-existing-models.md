# Firestore の読み込みに、今あるモデルの型を当てる

## なぜ

店舗・注文・メニューは `src/models` に型があるのに、読み込み口の `doc2data("...")` に型を渡しておらず、`DocumentData` のまま流すか、あとから `as` で言い切っていた。

## やること

- `doc2data<RestaurantInfoData>` / `doc2data<OrderInfoData>` / `doc2data<MenuData>` を渡し、後ろの `as` を消す。
- 型の無かった `ref({})` の2つ（注文詳細の `menuObj`、サブアカウントの `restaurantObj`）に型を付ける。
- 実行時の動きは変えない。`doc2data` に渡す文字列（`"resuatraut"` の綴り違いを含む）も変えない。

## 確かめること

`main` と、この変更のあとで `yarn build` し、`dist` を `diff -rq` で比べて同じであること。

## やらないこと

モデルの無いコレクション（`userLog`、お知らせ、お気に入り、見出し、各種ログなど）は、次の PR から。
