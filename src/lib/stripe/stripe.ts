import type { StripeConstructor } from "@stripe/stripe-js";

import { ownPlateConfig } from "@/config/project";

// Stripe.js は src/config/header.ts が head に入れる script（js.stripe.com/v3）で読む。
// @stripe/stripe-js からは型だけを使う。
declare const Stripe: StripeConstructor;

export const getStripeInstance = (stripeAccount: string) => {
  return Stripe(ownPlateConfig.stripe.apiKey, {
    stripeAccount,
  });
};

export const stripeActions = {
  capability_updated: 1,
  account_updated: 2,
};

export const stripeActionStrings = {
  [stripeActions.capability_updated]: "capability_updated",
  [stripeActions.account_updated]: "account_updated",
};
