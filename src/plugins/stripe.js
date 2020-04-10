
let stripe = null; // Single Instance

export const getStripeInstance = () => {
	if (stripe === null) {
		const stripeAPIToken = process.env.STRIPE_API_KEY;
		stripe = Stripe(stripeAPIToken);
	}
	return stripe;
}
