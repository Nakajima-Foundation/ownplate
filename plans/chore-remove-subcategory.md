# chore: 消えた category / subCategory の読み残しを片付ける

Nakajima-Foundation/ownplate#1986。メニューの模型から `category` / `subCategory` が消えたあとも読む側だけが残っていて、読んだ値は常に空。

## やること

- `src/lib/firebase/analytics.ts`: どこからも呼ばれていない `getDataForLayer` と、それだけが呼ぶ `sku_item_data_for_datalayer` を消す。`AnalyticsMenuData` の `category` / `subCategory` も消す
- `src/app/super/DownloadCSV.vue`（スーパー管理画面のメニュー CSV）: 常に空欄の `productId` / `categoryId` / `subcategoryCd` / `subcategoryId` 列を消す
- `src/lang/*`: どこからも参照されていない `order.subCategory` / `order.subCategoryId` を消す（`order.category` は `RestaurantPage.vue` が使うので残す）

## やらないこと

- `item_category` を `category1` に向ける件: `item_category` を送っていたのは消す関数だけなので、関数と一緒に消える。今動いている GA イベントに `category1` を足すのは GA に届く中身が増える変更なので、別に判断する
- `cancelReason`（issue のコメント）: 今回の範囲外。なお `AllOrders.vue` の `cancelReason` は `revenueCSVHeader` に入っていないので CSV には出ていない
