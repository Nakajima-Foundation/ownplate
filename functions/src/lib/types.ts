import * as admin from "firebase-admin";

export interface orderCreatedData {
  restaurantId: string;
  orderId: string;
}

export interface locationData {
  lat: number;
  lng: number;
}

export interface customerInfoData {
  zip: string;
  prefectureId: number;
  prefecture: string;
  address: string;
  name: string;
  email: string;
  location?: locationData;
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
  customerInfo: customerInfoData;
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

// Order related types
export interface OrderData {
  id?: string;
  uid: string;
  restaurantId?: string;
  ownerUid?: string;
  status: number;
  order: { [menuId: string]: number | number[] };
  menuItems?: { [menuId: string]: MenuItem };
  prices?: { [menuId: string]: number[] };
  options?: { [menuId: string]: any[] };
  rawOptions?: { [menuId: string]: any[][] };
  total: number;
  sub_total?: number;
  tax?: number;
  inclusiveTax?: boolean;
  totalCharge?: number;
  discountPrice?: number;
  promotionName?: string;
  promotionId?: string;
  tip?: number;
  shippingCost?: number;
  deliveryFee?: number;
  number?: number;
  phoneNumber?: string;
  name?: string;
  sendSMS?: boolean;
  printed?: boolean;
  timePlaced?: admin.firestore.Timestamp;
  timeEstimated?: admin.firestore.Timestamp;
  timePickupForQuery?: admin.firestore.Timestamp;
  timeCreated?: admin.firestore.Timestamp;
  updatedAt?: admin.firestore.FieldValue | admin.firestore.Timestamp;
  orderPlacedAt?: admin.firestore.FieldValue | admin.firestore.Timestamp;
  orderAcceptedAt?: admin.firestore.Timestamp;
  transactionCompletedAt?: admin.firestore.Timestamp;
  timeConfirmed?: admin.firestore.Timestamp;
  client_secret?: string;
  hasPayment?: boolean;
  memo?: string;
  isEC?: boolean;
  isDelivery?: boolean;
  isLiff?: boolean;
  lunchOrDinner?: string;
  isSavePay?: boolean;
  payment?: {
    stripe?: string;
  };
  accounting?: {
    food: {
      revenue: number;
      tax: number;
    };
    alcohol: {
      revenue: number;
      tax: number;
    };
  };
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

export interface PostageData {
  [key: string]: any;
}

export interface DeliveryData {
  [key: string]: any;
}
