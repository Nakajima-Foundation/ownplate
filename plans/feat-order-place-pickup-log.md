# feat: orderPlace で受取日時が選択肢に入っていたかを記録する

SingularitySociety/omochikaeri-docs#227 の 2（#229 の D）。サーバでも画面と同じ決まりで受取日時を判定し、外れる注文をログに残す。**まだ弾かない。** 実際の注文で、時間差（選んでから確定するまで）などで外れる注文がどれくらいあるかを見てから、3 で弾くかを決める。

## やること

- `src/utils/pickupCheck.ts`（新規）: `checkPickupOffered`。注文を確定する時点で画面が出す選択肢（`availablePickupDays` とラストオーダー）に、送られた受取日時が入っているか。外れたら理由（その日が無い／その時刻が無い）を返す。JST で数える
- `src/utils/pickupDays.ts`: 調理時間の既定値を `minimumCookTimeOf` にまとめ、`usePickupTime` からも使う
- `src/utils/exceptData.ts`: import を相対パスにする（functions にコピーするため）
- functions へのコピーに `shopCalendar.ts` / `pickupDays.ts` / `exceptData.ts` / `pickupCheck.ts` を足す（`scripts/copy2functions.sh`、CI のワークフロー）
- `functions/src/functions/order/orderPlace.ts`: EC 以外の店で `checkPickupOffered` を呼び、外れたら `console.warn` に店・注文・理由・受取日時・サーバの時刻を出す。判定が例外を出しても注文は続ける

## 見ないこと

- 「本日売り切れ」で今日を外す分（注文の写しに売り切れの日が無い）
