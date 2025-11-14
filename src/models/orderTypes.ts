import { FieldValue, Timestamp } from "./firebaseUtils";
import { OrderInfoData } from "./orderInfoData";

// Order option types (Firebase-independent)
export type OptionValue = string | number | boolean | null;
export type OrderOptions = OptionValue[];
export type OrderRawOption = OptionValue;

// Payment information
export interface PaymentInfo {
  stripe: string;
}

// Server-side extended order data (with generic Firebase types)
export interface OrderDataBase extends OrderInfoData {
  // for server
  ownerUid?: string;
  rawOptions?: { [menuId: string]: OptionValue[][] };
  promotionName?: string;
  promotionId?: string;
  sendSMS?: boolean;
  printed?: boolean;

  timePickupForQuery?: Timestamp;
  updatedAt?: FieldValue | Timestamp;
  client_secret?: string;
  hasPayment?: boolean;
  isLiff?: boolean;
  isSavePay?: boolean;
}

// Order update data structure (with generic Firebase types)
export interface UpdateDataOnOrderUpdateBase {
  status: number;
  updatedAt: FieldValue;
  orderAcceptedAt?: Timestamp;

  timeConfirmed?: Timestamp;
  transactionCompletedAt?: Timestamp;

  timeEstimated?: Timestamp;
  timePickupForQuery?: Timestamp;

  payment?: PaymentInfo;
}
