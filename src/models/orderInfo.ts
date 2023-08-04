import { Timestamp } from "firebase/firestore";

import { MenuImages } from "@/models/menu";
import { ownPlateConfig } from "@/config/project";
import { stripeRegion, orderType } from "@/utils/utils";
import { RestaurantInfoData } from "@/models/RestaurantInfo";
import { CustomerInfo } from "@/models/customer";

export interface OrderMenuItemData {
  category1: string;
  category2: string;
  itemName: string;
  price: number;
  images: MenuImages;
  itemPhoto: string;
  exceptDay: {[key:string]: boolean};
  exceptHour: {start: number, end: number};
  tax: string;
  productId: string; //mo
  category: string; //mo
  subCategory: string; //mo
}
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
  // options: {[key: string]: [[key: string]: string]}
  timeCreated: Timestamp ;
  timeEstimated: Timestamp; // TODO firestore timestamp
  timeConfirmed: Timestamp;
  timePlaced: Timestamp;
  transactionCompletedAt: Timestamp;
  
  status: number;
  restaurant: RestaurantInfoData; // ?
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
  isPickup: boolean;
  tip: number;
  menuItems: { [key: string]: OrderMenuItemData };
  phoneNumber: string;
  order: { [key: string]: [number] };
  options: { [key: string]: [string] };
  payment?: { [key: string]: string };
  type: string;

  prices: {[key: string]: {[key: string]: number}};
  orderPlacedAt: Timestamp;
  orderUpdatedAt: Timestamp;
  orderAcceptedAt: Timestamp;
  lastUpdatedAt: Timestamp;
  orderCustomerCanceledAt: Timestamp;
  uidPaymentCanceledBy: boolean;
  discountPrice: number;
  
  customerInfo: CustomerInfo;
  memo: string;

  groupId?: string; // mo
  cancelReason?: string; // mo
}

export interface OrderItemData {
  item: OrderMenuItemData;
  count: number | number[];
  id: string;
  options: string | [string];
  orderIndex: string[];
}

export class OrderInfo {}

export const order2ReportData = (
  order: OrderInfoData,
  serviceTaxRate: number,
  isInMo: boolean
) => {
  const multiple = stripeRegion.multiple;
  // @ts-ignore
  order.timeConfirmed = order?.timeConfirmed?.toDate();
  // @ts-ignore
  order.timePlaced = order?.timePlaced?.toDate();
  // @ts-ignore
  order.timeEstimated = order?.timeEstimated?.toDate();
  if (!order.accounting) {
    order.accounting = {
      food: {
        revenue: order.total - order.tax,
        tax: order.tax,
      },
      alcohol: {
        revenue: 0,
        tax: 0,
      },
    };
  }
  if (ownPlateConfig.region === "JP") {
    const serviceTax =
      Math.round(order.tip * (1 - 1 / (1 + serviceTaxRate)) * multiple) /
      multiple;
    order.accounting.service = {
      revenue: order.tip,
      tax: serviceTax,
    };
  } else {
    order.accounting.service = {
      revenue: order.tip,
      tax: 0,
    };
  }
  order.type = orderType(order);
  return order;
};
