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
