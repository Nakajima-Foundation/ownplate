export type OrderDataType = {
  [key: string]: number[];
};

import { MenuData } from "./menu";

export type CartItemsType = {
  [key: string]: MenuData;
};

export type CartOptionType = {
  [key: string]: (number | boolean)[][];
};
