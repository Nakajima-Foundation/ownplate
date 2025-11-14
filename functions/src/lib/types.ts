import * as admin from "firebase-admin";
import { OrderInfoData } from "../models/orderInfoData";
import { RestaurantInfoData } from "../models/RestaurantInfo";

export interface updateDataOnorderUpdate {
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

export interface RestaurantData {
  countryCode: string;
  phoneNumber: string;
}

// Order option types
export type OptionValue = string | number | boolean | null;
export type OrderOptions = OptionValue[];
export type OrderRawOption = OptionValue;

// Order related types
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

export interface PromotionData {
  promotionId: string;
  promotionName: string;
  enable: boolean;
  type: string;
  hasTerm?: boolean;
  termFrom?: admin.firestore.Timestamp;
  termTo?: admin.firestore.Timestamp;
  discountThreshold: number;
  discountMethod: string;
  discountValue: number;
  paymentRestrictions?: string;
  usageRestrictions?: boolean;
}

export interface UserPromotionHistoryData {
  uid: string;
  restaurantId: string;
  promotionId: string;
  orderId: string;
  totalCharge: number;
  discountPrice: number;
  isStripe: boolean;
  used: boolean;
  createdAt: admin.firestore.FieldValue;
  usedAt: admin.firestore.FieldValue;
}

export interface StripeCustomerInfo {
  customerId: string;
  payment_method?: string;
}

export interface StripeLatestCharge {
  payment_method: string;
  payment_method_details: {
    card?: {
      exp_month: number;
      exp_year: number;
      brand: string;
      last4: string;
    };
    type: string;
  };
}

export interface StripePaymentIntentWithCharge {
  latest_charge?: StripeLatestCharge;
  [key: string]: unknown;
}

export interface PostageData {
  [prefectureId: string]: number;
}

export interface DeliveryData {
  [areaId: string]: {
    fee?: number;
    minAmount?: number;
  };
}

// Validator option types
export interface ValidatorNumberOption {
  min?: number;
  max?: number;
  minDigits?: number;
  maxDigits?: number;
  required?: boolean;
}

export interface ValidatorStringOption {
  minLength?: number;
  maxLength?: number;
  minLen?: number;
  maxLen?: number;
  required?: boolean;
  pattern?: RegExp;
  type?: "number" | "alpha" | "alphanumeric" | "url";
}

// Express extended request types
export interface RequestWithRestaurant extends Express.Request {
  restaurant?: RestaurantInfoData;
}

// LINE API response types
export interface LineVerifyResponse {
  sub: string;
  nonce?: string;
  [key: string]: unknown;
}

export interface LineAccessTokenResponse {
  access_token: string;
  id_token?: string;
  [key: string]: unknown;
}

export interface LineProfileResponse {
  userId: string;
  displayName?: string;
  [key: string]: unknown;
}
