import type { OrderInfoData } from "../models/orderInfoData";
import { optionPriceRegex, toSignedNumber } from "./commonUtils.ts";

export const nameOfOrder = (order: OrderInfoData) => {
  return order && order.number !== undefined
    ? "#" + `00${order.number}`.slice(-3)
    : "";
};

export const formatOption = (
  option: string | null | undefined,
  localize: (price: number) => string,
) => {
  const text = option ?? "";
  const match = text.match(optionPriceRegex);
  if (match) {
    const price = toSignedNumber(match[1]);
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
