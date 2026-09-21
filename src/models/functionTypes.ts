import { Timestamp } from "./firebaseUtils";
import { CustomerInfo } from "./customer";
import { OrderStatus } from "./common";

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
  status: OrderStatus;
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

// Ping function call types
export interface PingData {
  restaurantId: string;
  operationType: string;
  pathName: string;
}

// Stripe function call types
export interface StripeDeleteRestaurantCardData {
  ownerUid: string;
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

// Web Push function call types
export interface CreatePushInviteData {
  restaurantId: string;
}

export interface CreatePushInviteResult {
  result: boolean;
  url: string;
  expiresAt: number;
}

// 押す前に招待が使えるか確かめる。状態は変えない。
export interface CheckPushInviteData {
  token: string;
  fid?: string;
}

export type PushInviteStatus =
  "usable" | "registered-here" | "not-found" | "used" | "expired";

export interface CheckPushInviteResult {
  result: boolean;
  status: PushInviteStatus;
}

// 登録するのは非ログインの端末なので、uid ではなくトークンが唯一の資格になる
export interface RedeemPushInviteData {
  token: string;
  fid: string;
  platform: string;
  name: string;
}

export interface RedeemPushInviteResult {
  result: boolean;
  restaurantId: string;
}

export interface SendTestWebPushData {
  restaurantId: string;
  title: string;
  body: string;
}

export interface SendTestWebPushResult {
  result: boolean;
  sent: number;
  failed: number;
  targets: number;
  codes: string[];
}
