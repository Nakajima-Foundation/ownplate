export type OrderDataType = {
  [key: string]: number[];
};

import { MenuData } from "./menu";

export type CartItemsType = Partial<Record<string, MenuData>>;

export type CartOptionType = {
  [key: string]: (boolean | string)[][];
};
