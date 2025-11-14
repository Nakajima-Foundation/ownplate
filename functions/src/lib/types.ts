import * as admin from "firebase-admin";
import { CustomerInfo } from "../models/customer";
import { OrderInfoData } from "../models/orderInfoData";

export interface orderCreatedData {
  restaurantId: string;
  orderId: string;
}

export interface orderPlacedData {
  restaurantId: string;
  orderId: string;
  tip: number;
  timeToPickup: admin.firestore.Timestamp;
  promotionId: string;
  affiliateId: string;
  waitingPayment: boolean;
  memo: string;
  userName: string;
  payStripe: boolean;
  customerInfo: CustomerInfo;
}

export interface orderUpdateData {
  restaurantId: string;
  orderId: string;
  status: number;
  timeEstimated?: admin.firestore.Timestamp;
}

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

export interface confirmIntentData {
  restaurantId: string;
  orderId: string;
  timeEstimated?: admin.firestore.Timestamp;
}

export interface orderCancelData {
  restaurantId: string;
  orderId: string;
  cancelReason: string;
}

export interface newOrderData {
  menuId: string;
  index: number;
}

export interface orderChangeData {
  restaurantId: string;
  orderId: string;
  newOrder: newOrderData[];
  isSavePay: boolean;
}

export interface orderCancelPaymentData {
  restaurantId: string;
  orderId: string;
}

export interface stripeOAuthConnectData {
  code: string;
}
export interface stripeOAuthVerifyData {
  account_id: string;
}

export interface stripeReceiptData {
  restaurantId: string;
  orderId: string;
}

export interface lineValidateData {
  code: string;
  redirect_uri: string;
  restaurantId?: string;
}
export interface liffAuthenticateData {
  token: string;
  liffIndexId: string;
}

export interface pingData {
  restaurantId: string;
  operationType: string;
  pathName: string;
}

export interface subAccountInvitate {
  email: string;
  name: string;
}

export interface subAccountInvitationAcceptDeny {
  messageId: string;
}

export interface subAccountDeleteChildData {
  childUid: string;
}

export interface smaregiAuthData {
  code: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface smaregiStoreListData {}
export interface smaregiProductListData {
  store_id: string;
}

export interface superTwilioCallData {
  restaurantId: string;
}

export interface dispatchData {
  cmd: string;
  uid: string;
  key: string;
  value: boolean;
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
