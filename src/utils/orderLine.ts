import { forceArray } from "@/utils/utils";
import { formatOption } from "@/utils/strings";
import { optionPrice } from "@/utils/commonUtils";
import { roundPrice } from "@/utils/price";

// 注文明細の 1 行に出す、選んだオプションの一覧。空の選択は出さない。
export const orderLineOptionsText = (
  options: string | string[],
  localize: (price: number) => string,
) =>
  forceArray(options)
    .filter((choice) => choice)
    .map((choice) => formatOption(choice, localize))
    .join(", ");

// 注文明細の 1 行の金額。オプションの加減額を単価に足してから数を掛ける。
export const orderLineTotalPrice = (
  unitPrice: number,
  options: string | string[],
  count: number,
) =>
  forceArray(options).reduce(
    (price, option) => price + roundPrice(optionPrice(option)),
    unitPrice,
  ) * count;
