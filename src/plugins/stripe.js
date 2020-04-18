export const getStripeInstance = (stripeAccount) => {
  const stripeAPIToken = process.env.STRIPE_API_KEY;
  return Stripe(stripeAPIToken, {
    stripeAccount: stripeAccount
  });
}

// LATER: Move the client-side Stripe API here, such as checkoutCreate
