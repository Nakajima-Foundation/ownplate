export const getStripeInstance = () => {
	const stripeAPIToken = process.env.STRIPE_API_KEY;
	return Stripe(stripeAPIToken);
}

// LATER: Move the client-side Stripe API here, such as checkoutCreate