import { functions, functionsJP } from "@/lib/firebase/firebase9";
import { httpsCallable } from "firebase/functions";

export const smaregiStoreList = httpsCallable(functionsJP, "smaregiStoreList");

export const smaregiProductList = httpsCallable(
  functionsJP,
  "smaregiProductList"
);

export const smaregiAuth = httpsCallable(functionsJP, "smaregiAuth");

export const lineVerifyFriend = httpsCallable(functionsJP, "lineVerifyFriend");

export const subAccountDeleteChild = httpsCallable(
  functionsJP,
  "subAccountDeleteChild"
);

export const subAccountInvite = httpsCallable(functionsJP, "subAccountInvite");

export const subAccountInvitationAccept = httpsCallable(
  functionsJP,
  "subAccountInvitationAccept"
);

export const subAccountInvitationDeny = httpsCallable(
  functionsJP,
  "subAccountInvitationDeny"
);

export const lineValidate = httpsCallable<{
  code: string, redirect_uri: string
}, {
  nonce: string,
  profile: {
    userId: string,
    displayName: string,
  }
}>(functionsJP, "lineValidate");

export const superDispatch = httpsCallable(functionsJP, "superDispatch");

export const superTwilio = httpsCallable(functionsJP, "superTwilio");

export const stripeDeleteCard = httpsCallable(functions, "stripeDeleteCard");

export const accountDelete = httpsCallable(functionsJP, "accountDelete");

export const orderUpdate = httpsCallable(functionsJP, "orderUpdateJp");

export const orderChange = httpsCallable(functionsJP, "orderChangeJp");

export const orderPlace = httpsCallable(functionsJP, "orderPlaceJp");

export const orderCreated = httpsCallable(functionsJP, "orderCreatedJp");

export const liffAuthenticate = httpsCallable<{
  liffIndexId: string,
  liffId: string,
  token: string,
}, {
  customToken: string;
  
}>(functionsJP, "liffAuthenticate");

export const ping = httpsCallable(functionsJP, "ping");
