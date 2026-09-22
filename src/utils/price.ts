import { stripe_regions_jp } from "../config/constant.ts";

// 通貨の最小単位に丸める。円は 1、セント建ての通貨なら 100。
//
// utils.ts から分けてあるのは、あちらが firebase と vue を読み込むため。
// 請求書やレシートの金額を組み立てる側は node から読めないと単体テストできない。
export const roundPrice = (price: number) => {
  const m = stripe_regions_jp.multiple;
  return Math.round(price * m) / m;
};
