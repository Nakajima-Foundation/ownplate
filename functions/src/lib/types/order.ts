import * as admin from "firebase-admin";
import { OrderInfoData } from "../../models/orderInfoData";

// Order option types
export type OptionValue = string | number | boolean | null;
export type OrderOptions = OptionValue[];
export type OrderRawOption = OptionValue;

// Server-side extended order data
export interface OrderData extends OrderInfoData {
  // for server
  ownerUid?: string;
  rawOptions?: { [menuId: string]: OptionValue[][] };
  promotionName?: string;
  promotionId?: string;
  sendSMS?: boolean;
  printed?: boolean;

  timePickupForQuery?: admin.firestore.Timestamp;
  updatedAt?: admin.firestore.FieldValue | admin.firestore.Timestamp;
  client_secret?: string;
  hasPayment?: boolean;
  isLiff?: boolean;
  isSavePay?: boolean;
}

// Order update data structure
export interface UpdateDataOnOrderUpdate {
  status: number;
  updatedAt: admin.firestore.FieldValue;
  orderAcceptedAt?: admin.firestore.Timestamp;

  timeConfirmed?: admin.firestore.Timestamp;
  transactionCompletedAt?: admin.firestore.Timestamp;

  timeEstimated?: admin.firestore.Timestamp;
  timePickupForQuery?: admin.firestore.Timestamp;

  payment?: {
    stripe: string;
  };
}
