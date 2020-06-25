import { functions } from "~/plugins/firebase"

export const getStripeInstance = (stripeAccount) => {
  const stripeAPIToken = process.env.STRIPE_API_KEY;
  if (stripeAccount) {
    return Stripe(stripeAPIToken, {
      stripeAccount
    });
  }
  return Stripe(stripeAPIToken);
}

export const stripeCreateIntent = functions.httpsCallable("stripeCreateIntent");
export const stripeConfirmIntent
  = functions.httpsCallable("stripeConfirmIntent");
export const stripeCancelIntent
  = functions.httpsCallable("stripeCancelIntent");
export const stripeConnect = functions.httpsCallable("stripeConnect");
export const stripeDisconnect = functions.httpsCallable("stripeDisconnect");
export const stripeVerify = functions.httpsCallable("stripeVerify");
export const stripeUpdateCustomer = functions.httpsCallable("stripeUpdateCustomer");

export const stripeActions = {
  capability_updated: 1,
  account_updated: 2,
};

export const stripeActionStrings = {
  [stripeActions.capability_updated]: "capability_updated",
  [stripeActions.account_updated]: "account_updated",
};
