import * as admin from "firebase-admin";

export interface orderCreatedData {
  restaurantId: string;
  orderId: string;
}

export interface customerInfoData {
  zip: string;
  prefectureId: number;
  address: string;
  name: string;
  email: string;
}
export interface orderPlacedData {
  restaurantId: string;
  orderId: string;
  tip: number;
  sendSMS: boolean;
  timeToPickup: admin.firestore.Timestamp;
  lng: string;
  memo: string;
  customerInfo: customerInfoData;
}

export interface orderUpdateData {
  restaurantId: string;
  orderId: string;
  status: number;
  timezone: string;
  lng?: string;
  timeEstimated?: admin.firestore.Timestamp;
}

export interface updateDataOnorderUpdate {
  status: number;
  updatedAt: admin.firestore.Timestamp;
  orderAcceptedAt?: admin.firestore.Timestamp;

  timeConfirmed?: admin.firestore.Timestamp;
  transactionCompletedAt?: admin.firestore.Timestamp;

  timeEstimated?: admin.firestore.Timestamp;
  timePickupForQuery?: admin.firestore.Timestamp;
}

export interface menuItem {
  price: number;
  itemName: string;
  itemPhoto: string;
  images: object;
  itemAliasesName: string;
  category1: string;
  category2: string;
  category: string;
  subCategory: string;
  exceptDay: object;
  exceptHour: object;
  productId: string;
  tax: number;
}

export interface confirmIntentData {
  restaurantId: string;
  orderId: string;
  timezone: string;
  lng?: string;
  timeEstimated?: admin.firestore.Timestamp;
}

export interface orderCancelData {
  restaurantId: string;
  orderId: string;
  lng?: string;
}

export interface newOrderData {
  menuId: string;
  index: number;
}

export interface orderChangeData {
  restaurantId: string;
  orderId: string;
  newOrder: newOrderData[];
  timezone: string;
  lng?: string;
}

export interface orderCancelPaymentData {
  restaurantId: string;
  orderId: string;
  lng?: string;
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

export interface stripeUpdateCustomerData {
  tokenId: string;
  reuse: string; // ??
}

export interface lineValidateData {
  code: string;
  redirect_uri: string;
}

export interface pingData {
  restaurantId: string;
  operationType: string;
  pathName: string;
}
