import type { OptionValue } from "./orderTypes";
export type OrderDataType = {
  [key: string]: number[];
};

import { MenuData } from "./menu";

export type CartItemsType = Partial<Record<string, MenuData>>;

// 店舗ページの合計。subTotal は商品ごとの小計（prices2subtotal）、total は税を足した合計（subtotal2total）。
export type CartTotalPrice = {
  subTotal: { [menuId: string]: number };
  total: number;
};

export type CartOptionType = {
  [key: string]: OptionValue[][];
};
