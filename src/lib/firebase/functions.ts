import { functionsJP } from "@/lib/firebase/firebase9";
import { httpsCallable } from "firebase/functions";
import type {
  DispatchData,
  LineVerifyFriendData,
  SubAccountDeleteChildData,
  SubAccountInvitateData,
  SubAccountInvitationAcceptDenyData,
  LineValidateData,
  OrderUpdateData,
  OrderCreatedData,
  LiffAuthenticateData,
  PingData,
  SuperTwilioCallData,
  OrderChangeData,
  OrderPlacedData,
  OrderPayData,
  StripeOAuthVerifyData,
  StripeDeleteRestaurantCardData,
  CheckPushInviteData,
  CheckPushInviteResult,
  CreatePushInviteData,
  CreatePushInviteResult,
  RedeemPushInviteData,
  RedeemPushInviteResult,
  SendTestWebPushData,
  SendTestWebPushResult,
} from "@/models/functionTypes";

export const lineVerifyFriend = httpsCallable<
  LineVerifyFriendData,
  {
    result: boolean;
  }
>(functionsJP, "lineVerifyFriend2");

export const subAccountDeleteChild = httpsCallable<
  SubAccountDeleteChildData,
  Record<string, never>
>(functionsJP, "subAccountDeleteChild2");

export const subAccountInvite = httpsCallable<
  SubAccountInvitateData,
  {
    result: boolean;
    childUid: string;
  }
>(functionsJP, "subAccountInvite2");

export const subAccountInvitationAccept =
  httpsCallable<SubAccountInvitationAcceptDenyData>(
    functionsJP,
    "subAccountInvitationAccept2",
  );

export const subAccountInvitationDeny =
  httpsCallable<SubAccountInvitationAcceptDenyData>(
    functionsJP,
    "subAccountInvitationDeny2",
  );

export const lineValidate = httpsCallable<
  LineValidateData,
  {
    nonce: string;
    profile: {
      userId: string;
      displayName: string;
    };
  }
>(functionsJP, "lineValidate2");

// cmd ごとに中身が違う。`setCustomClaim` は条件を満たさないと初期値の
// `{ result: false, message: "not processed" }` をそのまま返す（知らない cmd は例外）。
// 1つの形には決められないので、読む側が絞る前提で unknown のまま渡す。
export const superDispatch = httpsCallable<DispatchData, { result: unknown }>(
  functionsJP,
  "superDispatch2",
);

export const superTwilio = httpsCallable<SuperTwilioCallData>(
  functionsJP,
  "superTwilio2",
);

export const accountDelete = httpsCallable(functionsJP, "accountDelete2");

export const orderUpdate = httpsCallable<
  OrderUpdateData,
  {
    result: boolean;
    type: string;
  }
>(functionsJP, "orderUpdateJp2");

export const orderChange = httpsCallable<OrderChangeData>(
  functionsJP,
  "orderChangeJp2",
);

export const orderPlace = httpsCallable<OrderPlacedData>(
  functionsJP,
  "orderPlaceJp2",
);

export const orderCreated = httpsCallable<OrderCreatedData>(
  functionsJP,
  "orderCreatedJp2",
);

export const orderPay = httpsCallable<OrderPayData>(functionsJP, "stripepay2");

export const liffAuthenticate = httpsCallable<
  LiffAuthenticateData,
  {
    customToken: string;
  }
>(functionsJP, "liffAuthenticate2");

export const ping = httpsCallable<PingData>(functionsJP, "ping2");

export const stripeCancelIntent = httpsCallable(
  functionsJP,
  "stripeCancelIntent2",
);
export const stripePaymentCancelIntent = httpsCallable(
  functionsJP,
  "stripePaymentCancelIntent2",
);

export const stripeDeleteRestaurantCard = httpsCallable<
  StripeDeleteRestaurantCardData,
  { result: boolean }
>(functionsJP, "stripeDeleteRestaurantCard2");
export const stripeConnect = httpsCallable(functionsJP, "stripeConnect2");
export const stripeDisconnect = httpsCallable(functionsJP, "stripeDisconnect2");
// functions の super/stripeVerify.ts が Stripe の口座を読んで返す。画面が使う所だけを書く。
export const stripeVerify = httpsCallable<
  StripeOAuthVerifyData,
  {
    result?: boolean;
    account?: { capabilities?: { [key: string]: string } };
  }
>(functionsJP, "stripeVerify2");
export const stripeReceipt = httpsCallable<
  { restaurantId: string; orderId: string },
  { receipt_url?: string }
>(functionsJP, "stripeReceipt2");

export const createPushInvite = httpsCallable<
  CreatePushInviteData,
  CreatePushInviteResult
>(functionsJP, "createPushInvite2");
// 押す前に招待が使えるか確かめる。状態は変えないので、何度呼んでも安全。
export const checkPushInvite = httpsCallable<
  CheckPushInviteData,
  CheckPushInviteResult
>(functionsJP, "checkPushInvite2");
// 登録する端末はサインインしていない。トークンを知っていることが唯一の資格。
export const redeemPushInvite = httpsCallable<
  RedeemPushInviteData,
  RedeemPushInviteResult
>(functionsJP, "redeemPushInvite2");
export const sendTestWebPush = httpsCallable<
  SendTestWebPushData,
  SendTestWebPushResult,
  { result: boolean; sent: number; failed: number; targets: number }
>(functionsJP, "sendTestWebPush2");
