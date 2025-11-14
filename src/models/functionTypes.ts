import { Timestamp } from "./firebaseUtils";
import { CustomerInfo } from "./customer";

// Order related function call types
export interface OrderCreatedData {
  restaurantId: string;
  orderId: string;
}

export interface OrderPlacedData {
  restaurantId: string;
  orderId: string;
  tip: number;
  timeToPickup: Timestamp;
  promotionId: string;
  affiliateId: string;
  waitingPayment: boolean;
  memo: string;
  userName: string;
  payStripe: boolean;
  customerInfo: CustomerInfo;
}

export interface OrderUpdateData {
  restaurantId: string;
  orderId: string;
  status: number;
  timeEstimated?: Timestamp;
}

export interface ConfirmIntentData {
  restaurantId: string;
  orderId: string;
  timeEstimated?: Timestamp;
}

export interface OrderCancelData {
  restaurantId: string;
  orderId: string;
  cancelReason: string;
}

export interface NewOrderData {
  menuId: string;
  index: number;
}

export interface OrderChangeData {
  restaurantId: string;
  orderId: string;
  newOrder: NewOrderData[];
  isSavePay: boolean;
}

export interface OrderCancelPaymentData {
  restaurantId: string;
  orderId: string;
}

// Stripe related function call types
export interface StripeOAuthConnectData {
  code: string;
}

export interface StripeOAuthVerifyData {
  account_id: string;
}

export interface StripeReceiptData {
  restaurantId: string;
  orderId: string;
}

// LINE related function call types
export interface LineValidateData {
  code: string;
  redirect_uri: string;
  restaurantId?: string;
}

export interface LiffAuthenticateData {
  token: string;
  liffIndexId: string;
}

export interface LineVerifyFriendData {
  liffIndexId?: string;
  restaurantId?: string;
}

// Sub Account related function call types
export interface SubAccountInvitateData {
  email: string;
  name: string;
}

export interface SubAccountInvitationAcceptDenyData {
  messageId: string;
}

export interface SubAccountDeleteChildData {
  childUid: string;
}

// Smaregi related function call types
export interface SmaregiAuthData {
  code: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SmaregiStoreListData {}

export interface SmaregiProductListData {
  store_id: string;
}

// Ping function call types
export interface PingData {
  restaurantId: string;
  operationType: string;
  pathName: string;
}

// Super admin function call types
export interface SuperTwilioCallData {
  restaurantId: string;
}

export interface DispatchData {
  cmd: string;
  uid: string;
  key: string;
  value: boolean;
}
