import type { Timestamp } from "./firebaseUtils";

// admins/:uid/adminlogs。functions の super.ts（custom claim の付け外し）が書く。
export type AdminLogData = {
  id: string;
  uid: string;
  uidSuper: string;
  cmd: string;
  key: string;
  value: boolean;
  email?: string;
  success: boolean;
  error?: string;
  createdAt: Timestamp;
};

// restaurants/:id/log/:date/phoneLog。functions の notify2.ts（注文の電話）と
// super/twilio.ts（試しの電話）が書く。試しの電話には orderId が無い。
export type PhoneLogData = {
  id: string;
  restaurantId: string;
  date: string;
  orderId?: string;
  phoneNumber: string;
  updatedAt: Timestamp;
};

// admins/:uid/stripeLogs。functions の stripeLog.ts（Stripe の callback）が書く。
// 画面は data.uid も読むが、今の書き手は data に log しか入れない。
export type StripeLogData = {
  id: string;
  data: { log?: unknown; uid?: string };
  action: number;
  uid: string;
  type: string;
  created: Timestamp;
};

// requestList/:restaurantId。管理画面の店舗カード（admin/Index/Restaurant.vue）が書く。
export type ListingRequestData = {
  id: string;
  status: number;
  uid: string;
  created: Timestamp;
};
