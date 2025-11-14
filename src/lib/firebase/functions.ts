import { functionsJP } from "@/lib/firebase/firebase9";
import { httpsCallable } from "firebase/functions";
import type {
  SmaregiStoreListData,
  SmaregiProductListData,
  SmaregiAuthData,
  LineVerifyFriendData,
  SubAccountDeleteChildData,
  SubAccountInvitateData,
  SubAccountInvitationAcceptDenyData,
  LineValidateData,
  OrderUpdateData,
  OrderCreatedData,
  LiffAuthenticateData,
  PingData,
} from "@/models/functionTypes";

export const smaregiStoreList = httpsCallable<
  SmaregiStoreListData,
  {
    res: any[];
  }
>(functionsJP, "smaregiStoreList2");

export const smaregiProductList = httpsCallable<
  SmaregiProductListData,
  {
    res: any[];
  }
>(functionsJP, "smaregiProductList2");

export const smaregiAuth = httpsCallable<
  SmaregiAuthData,
  {
    result: boolean;
  }
>(functionsJP, "smaregiAuth2");

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
  }
>(functionsJP, "subAccountInvite2");

export const subAccountInvitationAccept = httpsCallable<SubAccountInvitationAcceptDenyData>(
  functionsJP,
  "subAccountInvitationAccept2",
);

export const subAccountInvitationDeny = httpsCallable<SubAccountInvitationAcceptDenyData>(
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

export const superDispatch = httpsCallable(functionsJP, "superDispatch2");

export const superTwilio = httpsCallable(functionsJP, "superTwilio2");

export const accountDelete = httpsCallable(functionsJP, "accountDelete2");

export const orderUpdate = httpsCallable<
  OrderUpdateData,
  {
    result: boolean;
    type: string;
  }
>(functionsJP, "orderUpdateJp2");

export const orderChange = httpsCallable(functionsJP, "orderChangeJp2");

export const orderPlace = httpsCallable(functionsJP, "orderPlaceJp2");

export const orderCreated = httpsCallable<OrderCreatedData>(functionsJP, "orderCreatedJp2");

export const orderPay = httpsCallable(functionsJP, "stripepay2");

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

export const stripeDeleteCard = httpsCallable(functionsJP, "stripeDeleteCard2");
export const stripeConnect = httpsCallable(functionsJP, "stripeConnect2");
export const stripeDisconnect = httpsCallable(functionsJP, "stripeDisconnect2");
export const stripeVerify = httpsCallable(functionsJP, "stripeVerify2");
export const stripeReceipt = httpsCallable(functionsJP, "stripeReceipt2");
