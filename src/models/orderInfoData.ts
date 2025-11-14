import { Timestamp } from "./firebaseUtils";
import { MenuItem } from "./menu";
import { CustomerInfo } from "./customer";

export interface OrderInfoData {
  id: string;
  name: string;
  number: string;
  uid: string;
  totalCharge: number;
  total: number;
  sub_total: number;
  inclusiveTax: boolean;
  deliveryFee: number;
  tax: number;
  timeCreated: Timestamp;
  timeEstimated: Timestamp;
  timeConfirmed: Timestamp;
  timePlaced: Timestamp;
  transactionCompletedAt: Timestamp;

  status: number;
  restaurantId: string; // ?
  description: string;
  accounting?: {
    food: {
      revenue: number;
      tax: number;
    };
    alcohol: {
      revenue: number;
      tax: number;
    };
    service?: {
      revenue: number;
      tax: number;
    };
  };
  shippingCost: number;
  isDelivery: boolean;
  isEC: boolean;
  tip: number;
  menuItems: { [key: string]: MenuItem };
  phoneNumber: string;
  order: { [key: string]: number[] };
  options: { [key: string]: string[] };
  payment?: {
    stripe?: string;
  };
  type: string;

  prices: { [key: string]: { [key: string]: number } };
  orderPlacedAt: Timestamp;
  orderUpdatedAt: Timestamp;
  orderAcceptedAt: Timestamp;
  lastUpdatedAt: Timestamp;
  orderCustomerCanceledAt: Timestamp;
  uidPaymentCanceledBy: boolean;
  discountPrice: number;

  customerInfo: CustomerInfo;
  memo: string;
  lunchOrDinner?: string;

  cancelReason?: string; // mo
}

export interface OrderItemData {
  item: MenuItem;
  count: number | number[];
  id: string;
  options: string | string[];
  orderIndex: string[];
  price?: number;
}
