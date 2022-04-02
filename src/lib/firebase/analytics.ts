import { analytics } from "@/lib/firebase/firebase9";
import { logEvent } from "firebase/analytics";
// see https://firebase.google.com/docs/analytics/measure-ecommerce

// Event List
// https://firebase.google.com/docs/reference/js/firebase.analytics.EventName
// https://developers.google.com/gtagjs/reference/ga4-events#login
// https://firebase.google.com/docs/reference/js/firebase.analytics.Analytics

import { MenuData } from "@/models/menu";
import { OrderInfoData } from "@/models/orderInfo";
import { RestaurantInfoData } from "@/models/RestaurantInfo";

interface AnalyticsMenuData extends MenuData {
  id: string;
  quantity: number;
}
interface AnalyticsData {
};

export const sku_item_data = (menu: AnalyticsMenuData, shopInfo: RestaurantInfoData, restaurantId: string) => {
  return {
    item_id: "SKU_" + menu.id,
    item_name: menu.itemName,
    item_brand: shopInfo.restaurantName,
    price: menu.price,
    promotion_id: restaurantId,
  };
};
export const sku_item_data2 = (menu: AnalyticsMenuData, shopInfo: RestaurantInfoData, restaurantId: string, quantity: number) => {
  return {
    item_id: "SKU_" + menu.id,
    item_name: menu.itemName,
    item_brand: shopInfo.restaurantName,
    price: menu.price,
    promotion_id: restaurantId,
    quantity,
  };
};

const analyticsWrapper = (eventName: string, data: AnalyticsData) => {
  console.log(eventName, data);
  logEvent(analytics, eventName, data);
};

export const sendMenuListView = (menus: AnalyticsMenuData[], shopInfo: RestaurantInfoData, restaurantId: string) => {
  try {
    const analyticsData = {
      item_list_id: restaurantId,
      item_list_name: shopInfo.restaurantName,
      items: menus.map((menu) => {
        return sku_item_data(menu, shopInfo, restaurantId);
      }),
    };
    analyticsWrapper("view_item_list", analyticsData);
  } catch (e) {
    console.log(e);
  }
};

export const sendBeginCheckoout = (price: number, menus: AnalyticsMenuData[], shopInfo: RestaurantInfoData, restaurantId: string) => {
  try {
    const analyticsData = {
      currency: "JPY",
      value: price,
      items: menus.map((menu) => {
        return sku_item_data2(menu, shopInfo, restaurantId, menu.quantity);
      }),
    };
    analyticsWrapper("begin_checkout", analyticsData);
  } catch (e) {
    console.log(e);
  }
};

export const sendPurchase = (
  orderInfo: OrderInfoData,
  orderId: string,
  menus: AnalyticsMenuData[],
  shopInfo: RestaurantInfoData,
  restaurantId: string
) => {
  try {
    const analyticsData = {
      transaction_id: orderId,
      affiliation: shopInfo.restaurantName,
      currency: "JPY",
      value: orderInfo.total,
      tax: orderInfo.tax,
      items: menus.map((menu) => {
        return sku_item_data2(menu, shopInfo, restaurantId, menu.quantity);
      }),
    };
    // console.log(analyticsData);
    analyticsWrapper("purchase", analyticsData);
  } catch (e) {
    console.log(e);
  }
};

export const sendRedunded = (orderInfo: OrderInfoData, orderId: string, shopInfo: RestaurantInfoData, restaurantId: string) => {
  try {
    const analyticsData = {
      transaction_id: orderId,
      affiliation: shopInfo.restaurantName,
      currency: "JPY",
      value: orderInfo.total,
      // items: [],
    };
    analyticsWrapper("refund", analyticsData);
  } catch (e) {
    console.log(e);
  }
};

// LOGIN

export const sendViewItem = (item: AnalyticsMenuData, shopInfo: RestaurantInfoData, restaurantId: string) => {
  // is open image
  try {
    const analyticsData = {
      currency: "JPY",
      value: item.price,
      items: [sku_item_data(item, shopInfo, restaurantId)],
    };
    analyticsWrapper("view_item", analyticsData);
  } catch (e) {
    console.log(e);
  }
};

export const sendSelectItem = (item: AnalyticsMenuData, shopInfo: RestaurantInfoData, restaurantId: string) => {
  // is open toggle
  try {
    const analyticsData = {
      items: [sku_item_data(item, shopInfo, restaurantId)],
    };
    // console.log(analyticsData);
    analyticsWrapper("select_item", analyticsData);
  } catch (e) {
    console.log(e);
  }
};

export const sendAddToCart = (item: AnalyticsMenuData, shopInfo: RestaurantInfoData, restaurantId: string, quantity: number) => {
  try {
    const analyticsData = {
      currency: "JPY",
      value: item.price,
      items: [sku_item_data2(item, shopInfo, restaurantId, quantity)],
    };
    // console.log(analyticsData);
    analyticsWrapper("add_to_cart", analyticsData);
  } catch (e) {
    console.log(e);
  }
};

export const sendRemoveFromCart = (item: AnalyticsMenuData, shopInfo: RestaurantInfoData, restaurantId: string, quantity: number) => {
  try {
    const analyticsData = {
      currency: "JPY",
      value: item.price,
      items: [sku_item_data2(item, shopInfo, restaurantId, quantity)],
    };
    // console.log(analyticsData);
    analyticsWrapper("remove_from_cart", analyticsData);
  } catch (e) {
    console.log(e);
  }
};

export const sendViewCart = (
  orderInfo: OrderInfoData,
  orderId: string,
  menus: AnalyticsMenuData[],
  shopInfo: RestaurantInfoData,
  restaurantId: string
) => {
  try {
    const analyticsData = {
      currency: "JPY",
      value: orderInfo.total,
      items: menus.map((menu) => {
        return sku_item_data2(menu, shopInfo, restaurantId, menu.quantity);
      }),
    };
    // console.log(analyticsData);
    analyticsWrapper("view_cart", analyticsData);
  } catch (e) {
    console.log(e);
  }
};

/*
VIEW_CART
ADD_PAYMENT_INFO // input card
*/
