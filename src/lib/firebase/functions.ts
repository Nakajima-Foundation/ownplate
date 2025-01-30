import { functionsJP } from "@/lib/firebase/firebase9";
import { httpsCallable } from "firebase/functions";
import { Timestamp } from "firebase/firestore";

export const smaregiStoreList = httpsCallable<
  Record<string, never>,
  {
    res: any[];
  }
>(functionsJP, "smaregiStoreList2");

export const smaregiProductList = httpsCallable<
  {
    store_id: string;
  },
  {
    res: any[];
  }
>(functionsJP, "smaregiProductList2");

export const smaregiAuth = httpsCallable<
  {
    code: string;
  },
  {
    result: boolean;
  }
>(functionsJP, "smaregiAuth2");

export const lineVerifyFriend = httpsCallable<
  {
    liffIndexId?: string;
    restaurantId?: string;
  },
  {
    result: boolean;
  }
>(functionsJP, "lineVerifyFriend2");

export const subAccountDeleteChild = httpsCallable<
  {
    childUid: string;
  },
  Record<string, never>
>(functionsJP, "subAccountDeleteChild2");

export const subAccountInvite = httpsCallable<
  {
    email: string;
    name: string;
  },
  {
    result: boolean;
  }
>(functionsJP, "subAccountInvite2");

export const subAccountInvitationAccept = httpsCallable<{
  messageId: string;
}>(functionsJP, "subAccountInvitationAccept2");

export const subAccountInvitationDeny = httpsCallable<{
  messageId: string;
}>(functionsJP, "subAccountInvitationDeny2");

export const lineValidate = httpsCallable<
  {
    code: string;
    redirect_uri: string;
    restaurantId?: string;
  },
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
  {
    restaurantId: string;
    orderId: string;
    status: number;
    timeEstimated?: Timestamp;
  },
  {
    result: boolean;
    type: string;
  }
>(functionsJP, "orderUpdateJp2");

export const orderChange = httpsCallable(functionsJP, "orderChangeJp2");

export const orderPlace = httpsCallable(functionsJP, "orderPlaceJp2");

export const orderCreated = httpsCallable(functionsJP, "orderCreatedJp2");

export const orderPay = httpsCallable(functionsJP, "stripepay2");

export const liffAuthenticate = httpsCallable<
  {
    liffIndexId: string;
    liffId: string;
    token: string;
  },
  {
    customToken: string;
  }
>(functionsJP, "liffAuthenticate2");

export const ping = httpsCallable(functionsJP, "ping2");

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
