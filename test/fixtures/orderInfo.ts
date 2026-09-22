import { Timestamp } from "firebase/firestore";

import type { OrderInfoData } from "../../src/models/orderInfoData.ts";

// 型を満たす注文ひとつ分。テストは必要な項目だけ上書きして使う。
//
// 時刻は本物の Timestamp を使う。`{ toDate: () => Date }` で代用すると型が通らず、
// 通すために型を緩めると、Firestore が実際に返す形と違うものを検証することになる。
// firebase/firestore は node からそのまま読める。
export const timestampOf = (iso: string): Timestamp =>
  Timestamp.fromDate(new Date(iso));

const handoverTime = timestampOf("2026-09-22T03:00:00Z");
const requestedTime = timestampOf("2026-09-22T09:00:00Z");
const placedTime = timestampOf("2026-09-21T12:00:00Z");

const base: OrderInfoData = {
  id: "test-order",
  name: "山田",
  number: "653",
  uid: "customer-uid",

  totalCharge: 1500,
  total: 1500,
  sub_total: 1381,
  inclusiveTax: true,
  deliveryFee: 0,
  tax: 119,

  timeCreated: placedTime,
  timeEstimated: handoverTime,
  timeConfirmed: handoverTime,
  timePlaced: requestedTime,
  transactionCompletedAt: handoverTime,

  status: 300,
  restaurantId: "test-restaurant",
  description: "",

  accounting: {
    food: { revenue: 1000, tax: 74 },
    alcohol: { revenue: 500, tax: 45 },
  },

  shippingCost: 0,
  isDelivery: false,
  isEC: false,
  tip: 0,
  menuItems: {},
  phoneNumber: "09012345678",
  order: {},
  options: {},
  payment: {},
  type: "",

  prices: {},
  orderPlacedAt: placedTime,
  orderUpdatedAt: placedTime,
  orderAcceptedAt: handoverTime,
  lastUpdatedAt: placedTime,
  orderCustomerCanceledAt: placedTime,
  uidPaymentCanceledBy: false,
  discountPrice: 0,

  customerInfo: {},
  memo: "",
};

export const orderInfoFixture = (
  overrides: Partial<OrderInfoData> = {},
): OrderInfoData => ({ ...base, ...overrides });
