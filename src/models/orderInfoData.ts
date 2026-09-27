import { Timestamp } from "./firebaseUtils";
import { MenuData } from "./menu";
import { CustomerInfo } from "./customer";
import { OrderStatus } from "./common";
import type { RestaurantInfoData } from "./RestaurantInfo";

// 注文の行番号から、その行のオプションを引く。
export type OptionsByLine = { [lineIndex: number]: string | string[] };

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

  status: OrderStatus;
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

  // 券を使った注文に、確定時に書かれる（functions の orderPlace）。
  promotionId?: string;
  promotionName?: string;

  // LINE の中から注文したか。注文を作るときに画面が入れる。
  isLiff?: boolean;

  // 一覧の画面が、注文ごとに店舗を引いて後から付ける。Firestore には無い。
  restaurant?: RestaurantInfoData;
  isDelivery: boolean;
  isEC: boolean;
  tip: number;
  menuItems?: { [key: string]: MenuData };
  phoneNumber: string;
  // 行ごとの数。古い注文は数値ひとつ。
  order: { [key: string]: number[] | number };
  // Firestore は配列の入れ子を持てないので、行番号をキーにしたオブジェクトで入る。古い注文は配列ひとつ。
  options: { [key: string]: OptionsByLine };
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
  orderRestaurantCanceledAt?: Timestamp;
  orderCookingCompletedAt?: Timestamp;
  transactionHideAt?: Timestamp;
  uidPaymentCanceledBy: boolean;
  discountPrice: number;

  customerInfo: CustomerInfo;
  memo: string;
  lunchOrDinner?: string;
}

export interface OrderItemData {
  item: MenuData;
  count: number;
  id: string;
  options: string | string[];
  orderIndex: string[];
  price?: number;
}
