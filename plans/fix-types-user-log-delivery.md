# Firestore の読み込みに型を付ける（2: 注文詳細と店舗ページのまわり）

## やること

- モデルを足す。
  - `src/models/userLog.ts`（`restaurants/:id/userLog/:uid`、functions の orderPlace が書く）
  - `src/models/deliveryArea.ts`（`restaurants/:id/delivery/area`、管理画面の配達設定が書く）
- `commonUtils.ts` の `PostageInfo` を export し、送料（`ec/postage`）の読み込みに使う。
- 型を当てる所:
  - 注文詳細: `userLog`・配達設定・送料・お客様情報、注文そのもの（`as OrderInfoData` を `collectionData` にする）
  - 利用者の注文履歴: `userLog`（画面の中で手書きしていた型をモデルに置き換える）
  - お客様の店舗ページ: 支払い設定（`PaymentInfo`）・配達設定
  - 注文確認: 送料
  - お客様情報の表示: お客様情報
- 配達設定を受け取る props（5つ）は、これまで `type: Object` だった。`DeliveryAreaData` にする。

## 実行時の動き

- 型を付けるだけで、値や分岐は変えない。
- 増えるのは `collectionData`（引数をそのまま返す関数）の呼び出しだけ。場所は配達設定の読み込みと、注文詳細の注文。
  - 配達設定は項目がそろった型なので、`{}` を入れるのに要る。
  - 注文詳細の注文は `as` の代わり。
- 配達設定を「項目が無いかもしれない」型（`Partial`）にすると、読む側で型エラーが出る。直すには読む側のコードを変えることになるので、今回はやめた。読むまでは空の値が子に渡るのは、今までと同じ。

## 確かめること

- typecheck 3種 / lint / test / build
- e2e: `deliveryConditions` / `adminOrder` / `continuousOrder` / `orderHistory` / `shop`
