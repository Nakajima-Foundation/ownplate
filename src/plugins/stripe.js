import { functions } from "~/plugins/firebase"

export const getStripeInstance = (stripeAccount) => {
  const stripeAPIToken = process.env.STRIPE_API_KEY;
  return Stripe(stripeAPIToken, {
    stripeAccount: stripeAccount
  });
}

export const checkoutCreate = functions.httpsCallable("checkoutCreate");
export const checkoutConfirm = functions.httpsCallable("checkoutConfirm");
export const checkoutCancel = functions.httpsCallable("checkoutCancel");
export const stripeConnect = functions.httpsCallable("stripeConnect");
export const stripeDisconnect = functions.httpsCallable("stripeDisconnect");

