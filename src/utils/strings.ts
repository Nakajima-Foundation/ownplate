import type { OrderInfoData } from "../models/orderInfoData";
import { convOptionPrice, optionPriceRegex } from "./commonUtils.ts";

export const nameOfOrder = (order: OrderInfoData) => {
  return order && order.number !== undefined
    ? "#" + `00${order.number}`.slice(-3)
    : "";
};

// 金額の部分を店舗の通貨で書き直した選択肢の名前。値の取り出し方は commonUtils の
// optionPrice と同じ規則を使う。
export const formatOption = (
  option: string | null | undefined,
  localize: (price: number) => string,
) => {
  const text = option ?? "";
  const match = text.match(optionPriceRegex);
  if (match) {
    const price = convOptionPrice(match[1]);
    return (
      text.slice(0, match.index) +
      "(" +
      (price > 0 ? "+" : "") +
      localize(price) +
      ")"
    );
  }
  return text;
};

export const halfCharactors = (str: string) => {
  return str.replace(/[（）Ａ-Ｚａ-ｚ０-９]/g, (s) => {
    return String.fromCharCode(s.charCodeAt(0) - 65248);
  });
};
