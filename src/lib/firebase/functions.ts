import { functions, functionsJP } from "@/lib/firebase/firebase9";
import { httpsCallable } from "firebase/functions";


export const smaregiStoreList = httpsCallable(
  functionsJP,
  "smaregiStoreList"
);

export const smaregiProductList = httpsCallable(
  functionsJP,
  "smaregiProductList"
);

export const smaregiAuth = httpsCallable(
  functionsJP,
  "smaregiAuth"
);

export const subAccountDeleteChild = httpsCallable(
  functions,
  "subAccountDeleteChild"
);


export const subAccountInvite = httpsCallable(
  functions,
  "subAccountInvite"
);
