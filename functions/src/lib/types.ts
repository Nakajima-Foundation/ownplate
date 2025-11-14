import * as admin from "firebase-admin";
import { OrderInfoData } from "../models/orderInfoData";

// Re-export function call types from shared models
export type {
  OrderCreatedData,
  OrderPlacedData,
  OrderUpdateData,
  ConfirmIntentData,
  OrderCancelData,
  NewOrderData,
  OrderChangeData,
  OrderCancelPaymentData,
  StripeOAuthConnectData,
  StripeOAuthVerifyData,
  StripeReceiptData,
  LineValidateData,
  LiffAuthenticateData,
  SubAccountInvitateData,
  SubAccountInvitationAcceptDenyData,
  SubAccountDeleteChildData,
  SmaregiAuthData,
  SmaregiStoreListData,
  SmaregiProductListData,
  PingData,
  SuperTwilioCallData,
  DispatchData,
} from "../models/functionTypes";

// Legacy aliases for backward compatibility (lowercase versions)
export type { OrderCreatedData as orderCreatedData } from "../models/functionTypes";
export type { OrderPlacedData as orderPlacedData } from "../models/functionTypes";
export type { OrderUpdateData as orderUpdateData } from "../models/functionTypes";
export type { ConfirmIntentData as confirmIntentData } from "../models/functionTypes";
export type { OrderCancelData as orderCancelData } from "../models/functionTypes";
export type { NewOrderData as newOrderData } from "../models/functionTypes";
export type { OrderChangeData as orderChangeData } from "../models/functionTypes";
export type { OrderCancelPaymentData as orderCancelPaymentData } from "../models/functionTypes";
export type { StripeOAuthConnectData as stripeOAuthConnectData } from "../models/functionTypes";
export type { StripeOAuthVerifyData as stripeOAuthVerifyData } from "../models/functionTypes";
export type { StripeReceiptData as stripeReceiptData } from "../models/functionTypes";
export type { LineValidateData as lineValidateData } from "../models/functionTypes";
export type { LiffAuthenticateData as liffAuthenticateData } from "../models/functionTypes";
export type { PingData as pingData } from "../models/functionTypes";
export type { SubAccountInvitateData as subAccountInvitate } from "../models/functionTypes";
export type { SubAccountInvitationAcceptDenyData as subAccountInvitationAcceptDeny } from "../models/functionTypes";
export type { SubAccountDeleteChildData as subAccountDeleteChildData } from "../models/functionTypes";
export type { SmaregiAuthData as smaregiAuthData } from "../models/functionTypes";
export type { SmaregiStoreListData as smaregiStoreListData } from "../models/functionTypes";
export type { SmaregiProductListData as smaregiProductListData } from "../models/functionTypes";
export type { SuperTwilioCallData as superTwilioCallData } from "../models/functionTypes";
export type { DispatchData as dispatchData } from "../models/functionTypes";

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

export interface MenuImages {
  item?: {
    resizedImages: {
      [key: string]: string;
    };
    original: string;
    path?: string;
  };
}

export interface ExceptHour {
  start?: number;
  end?: number;
}

export interface MenuItem {
  price: number;
  itemName: string;
  itemPhoto: string;
  images: MenuImages;
  itemAliasesName: string;
  category1: string;
  category2: string;
  exceptDay: { [key: string]: boolean };
  exceptHour: ExceptHour;
  tax: string;
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

export interface RestaurantInfoData {
  restaurantId: string;
  restaurantName: string;
  uid: string;
  phoneNumber: string;
  publicFlag: boolean;
  deletedFlag?: boolean;
  isEC?: boolean;
  hasLine?: boolean;
  inclusiveTax?: boolean;
  alcoholTax?: number;
  foodTax?: number;
  orderCount?: number;
  enableDelivery?: boolean;
  supportLiff?: boolean;
  enableLunchDinner?: boolean;
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
