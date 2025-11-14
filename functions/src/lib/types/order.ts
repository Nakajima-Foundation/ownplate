import * as admin from "firebase-admin";
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
export type OrderData = OrderDataBase<admin.firestore.Timestamp, admin.firestore.FieldValue>;
export type UpdateDataOnOrderUpdate = UpdateDataOnOrderUpdateBase<admin.firestore.Timestamp, admin.firestore.FieldValue>;
