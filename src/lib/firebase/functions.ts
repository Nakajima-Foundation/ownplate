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
  functions,
  "subAccountDeleteChild"
);

export const subAccountInvite = httpsCallable(functions, "subAccountInvite");

export const lineValidate = httpsCallable(functions, "lineValidate");

export const lineAuthenticate = httpsCallable(functions, "lineAuthenticate");

export const lineSetCustomClaim = httpsCallable(
  functions,
  "lineSetCustomClaim"
);

export const traceProcess = httpsCallable(functions, "traceProcess");

export const subAccountInvitationAccept = httpsCallable(
  functions,
  "subAccountInvitationAccept"
);

export const subAccountInvitationDeny = httpsCallable(
  functions,
  "subAccountInvitationDeny"
);

export const superDispatch = httpsCallable(functions, "superDispatch");

export const superTwilio = httpsCallable(functions, "superTwilio");

export const stripeDeleteCard = httpsCallable(functions, "stripeDeleteCard");

export const accountDelete = httpsCallable(functions, "accountDelete");

export const orderUpdate = httpsCallable(functionsJP, "orderUpdateJp");

export const orderChange = httpsCallable(functionsJP, "orderChangeJp");

export const orderPlace = httpsCallable(functionsJP, "orderPlaceJp");

export const wasOrderCreated = httpsCallable(functionsJP, "wasOrderCreatedJp");

export const liffAuthenticate = httpsCallable(functionsJP, "liffAuthenticate");
