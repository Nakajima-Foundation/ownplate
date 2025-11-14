export interface StripeCustomerInfo {
  customerId: string;
  payment_method?: string;
}

export interface StripeLatestCharge {
  payment_method: string;
  payment_method_details: {
    card?: {
      exp_month: number;
      exp_year: number;
      brand: string;
      last4: string;
    };
    type: string;
  };
}

export interface StripePaymentIntentWithCharge {
  latest_charge?: StripeLatestCharge;
  [key: string]: unknown;
}
