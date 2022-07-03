import { functions } from "@/lib/firebase/firebase9";
import { httpsCallable } from "firebase/functions";
import { ownPlateConfig } from "@/config/project";

const apiKey = ownPlateConfig.stripe.apiKey;

export const getStripeInstance = () => {
  const stripeAPIToken = apiKey;
  // @ts-ignore
  return Stripe(stripeAPIToken);
};

export const stripeCreateIntent = httpsCallable(
  functions,
  "stripeCreateIntent"
);
export const stripeConfirmIntent = httpsCallable(
  functions,
  "stripeConfirmIntent"
);
export const stripeCancelIntent = httpsCallable(
  functions,
  "stripeCancelIntent"
);
export const stripePaymentCancelIntent = httpsCallable(
  functions,
  "stripePaymentCancelIntent"
);

export const stripeConnect = httpsCallable(functions, "stripeConnect");
export const stripeDisconnect = httpsCallable(functions, "stripeDisconnect");
export const stripeVerify = httpsCallable(functions, "stripeVerify");
export const stripeUpdateCustomer = httpsCallable(
  functions,
  "stripeUpdateCustomer"
);
export const stripeReceipt = httpsCallable(functions, "stripeReceipt");

export const stripeActions = {
  capability_updated: 1,
  account_updated: 2,
};

export const stripeActionStrings = {
  [stripeActions.capability_updated]: "capability_updated",
  [stripeActions.account_updated]: "account_updated",
};
