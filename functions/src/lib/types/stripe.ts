// Stripe customer information stored in Firestore
export interface StripeCustomerInfo {
  customerId: string;
  payment_method?: string;
}

// Stripe charge object (part of PaymentIntent)
export interface StripeLatestCharge {
  id: string;
  object: "charge";
  amount: number;
  payment_method: string;
  payment_method_details: {
    card?: {
      brand: string;              // Card brand (visa, mastercard, etc.)
      last4: string;              // Last 4 digits
      exp_month: number;          // Expiration month
      exp_year: number;           // Expiration year
      fingerprint?: string;       // Card fingerprint
      funding?: string;           // Funding type (credit, debit, prepaid)
      network?: string;           // Card network
    };
    type: string;                 // Payment method type (card, etc.)
  };
  status: string;                 // Charge status
  currency: string;               // Currency code
  created?: number;               // Creation timestamp
}

// Stripe PaymentIntent with expanded latest_charge
// https://stripe.com/docs/api/payment_intents/object
export interface StripePaymentIntentWithCharge {
  id: string;
  object: "payment_intent";
  amount: number;
  currency: string;
  status: string;                 // Status: requires_payment_method, requires_confirmation, requires_action, processing, requires_capture, canceled, succeeded
  client_secret?: string;
  customer?: string;              // Customer ID
  payment_method?: string;        // Payment method ID
  latest_charge?: StripeLatestCharge;
  metadata?: Record<string, string>;
  description?: string;
  created?: number;
}
