# fix: 店舗情報の営業時間で、日曜だけ「Open」が出ない

SingularitySociety/omochikaeri-docs#230。

## 原因

`ShopInfo.vue` の `isOpen` が今日の曜日（日曜が 0）を営業時間のキー（日曜が "7"）とそのまま比べていた。今日の行の強調は `% 7` でそろえていたが、`isOpen` には無かった。

## 直し方

- 判定を `src/utils/shopOpen.ts` の `openNowByDay` に切り出し、曜日の比較を `% 7` にそろえる。曜日と 0 時からの分は `shopCalendar` で読む
- `test/unit/test_shopOpen.ts`: 日曜・平日、営業時間の内と外（端を含む）、複数の時間帯、営業日でない日、ほかの曜日の営業時間を読まないこと
- e2e（`pickupScreens.spec.ts`）: 日曜と月曜の 14:00 に、今日の行に「Open」が出る
