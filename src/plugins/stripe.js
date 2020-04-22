import { functions } from "~/plugins/firebase"

export const getStripeInstance = (stripeAccount) => {
  const stripeAPIToken = process.env.STRIPE_API_KEY;
  return Stripe(stripeAPIToken, {
    stripeAccount: stripeAccount
  });
}

export const stripeCreateIntent = functions.httpsCallable("stripeCreateIntent");
export const stripeConfirmIntent
  = functions.httpsCallable("stripeConfirmIntent");
export const stripeCancelIntent
  = functions.httpsCallable("stripeCancelIntent");
export const stripeConnect = functions.httpsCallable("stripeConnect");
export const stripeDisconnect = functions.httpsCallable("stripeDisconnect");

