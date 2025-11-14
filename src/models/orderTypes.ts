import { OrderInfoData } from "./orderInfoData";

// Order option types (Firebase-independent)
export type OptionValue = string | number | boolean | null;
export type OrderOptions = OptionValue[];
export type OrderRawOption = OptionValue;

// Payment information
export interface PaymentInfo {
  stripe: string;
}

// Generic Timestamp type to be compatible with both firebase and firebase-admin
export type GenericTimestamp = {
  seconds: number;
  nanoseconds: number;
  toDate(): Date;
};

// Generic FieldValue type to be compatible with both firebase and firebase-admin
export type GenericFieldValue = unknown;

// Server-side extended order data (with generic Firebase types)
export interface OrderDataBase<TTimestamp = GenericTimestamp, TFieldValue = GenericFieldValue> extends OrderInfoData {
  // for server
  ownerUid?: string;
  rawOptions?: { [menuId: string]: OptionValue[][] };
  promotionName?: string;
  promotionId?: string;
  sendSMS?: boolean;
  printed?: boolean;

  timePickupForQuery?: TTimestamp;
  updatedAt?: TFieldValue | TTimestamp;
  client_secret?: string;
  hasPayment?: boolean;
  isLiff?: boolean;
  isSavePay?: boolean;
}

// Order update data structure (with generic Firebase types)
export interface UpdateDataOnOrderUpdateBase<TTimestamp = GenericTimestamp, TFieldValue = GenericFieldValue> {
  status: number;
  updatedAt: TFieldValue;
  orderAcceptedAt?: TTimestamp;

  timeConfirmed?: TTimestamp;
  transactionCompletedAt?: TTimestamp;

  timeEstimated?: TTimestamp;
  timePickupForQuery?: TTimestamp;

  payment?: PaymentInfo;
}
