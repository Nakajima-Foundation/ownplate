import {
  OptionValue,
  OrderOptions,
  OrderRawOption,
  OrderDataBase,
  UpdateDataOnOrderUpdateBase,
} from "../../models/orderTypes";

// Re-export shared types
export type { OptionValue, OrderOptions, OrderRawOption };

// Functions-specific types using firebase-admin
export type OrderData = OrderDataBase;
export type UpdateDataOnOrderUpdate = UpdateDataOnOrderUpdateBase;
