import { ownPlateConfig } from "@/config/project";

export const getStripeInstance = (stripeAccount: string) => {
  // @ts-ignore
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
