# 店舗情報の入力検証を Firebase から切り離して試験を足す

SingularitySociety/omochikaeri-docs#210

## 何をしたか

### 1. 純粋な部分を別ファイルへ移す（中身は一字も変えていない）

`src/utils/admin/RestaurantPageUtils.ts` には性質の違うものが同居していた。
`copyRestaurant` のためにファイルの先頭で Firebase を読み込んでいるので、
**import した時点で初期化が走り、`shopInfoValidator` に単体試験が書けなかった。**

`defaultShopInfo` と `shopInfoValidator`（と、その型）を
`src/utils/admin/shopInfoForm.ts` へ移した。`copyRestaurant` は元のファイルに残した。
呼び出し元は2つだけなので import 先を書き換えた。再輸出はしていない。

移した行が一字一句同じであることは、移動前の内容と突き合わせて確認した。

### 2. 営業時間の規則を切り出す

型（`openTimes`）が実態より狭く、**画面が実際に作る形を試験から渡せなかった**。
時刻選択は空欄を選ぶと項目ごと消すので、片方だけ入っている枠も枠そのものが無い形も来る
（omochikaeri-docs#208）。

規則を `src/utils/admin/businessHours.ts` の `businessHoursErrors` として切り出し、
受け取る型を実態に合わせた。`shopInfoValidator` はそれを呼ぶ。

### 3. 試験を足す

`shopInfoValidator` と `businessHoursErrors` の両方に。通る場合と、**弾くべきものが
弾かれているか**の両方向。

## 挙動が同じであることの確かめ方

**読んで確かめてはいない。旧実装を控えて、新実装と並べて走らせた。**

- 営業日と営業時間の組み合わせを総当たり、それ以外の欄を1つずつ、さらに全部混ぜて無作為に。
  戻り値を丸ごと文字列にして比較し、**違いは出なかった**
- ただしゼロは生成器についての主張でしかないので、**直した行を一つずつ壊して**
  harness が違いを出せることを確かめた。8通りすべてで差が出て、戻すとゼロに戻った
- 足した試験についても同じ6通りで壊し、すべて赤くなることを見た

## 確かめていないこと

**管理画面に店舗オーナーとしてログインして保存を試してはいない。** 開発サーバを立てて、
変えた5つのファイルが解決して配信されること、`Index.vue` の import 先が新しい
ファイルを指していることまでは見た。
