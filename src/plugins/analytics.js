import * as firebase from "firebase/app";
import { analytics } from "~/plugins/firebase.js";

// see https://firebase.google.com/docs/analytics/measure-ecommerce

// Event List
// https://firebase.google.com/docs/reference/js/firebase.analytics.EventName

export const sku_item_data = (menu, shopInfo) => {
  return {
    item_id: 'SKU_' + menu.id,
    item_name: menu.itemName,
    item_brand: shopInfo.restaurantName,
    price: menu.price,
  };
};

export const sendMenuListView = (menus, shopInfo, restaurantId) => {
  try {
    const analyticsData = {
      item_list_id: restaurantId,
      item_list_name: shopInfo.restaurantName,
      items: menus.map((item) => {
        return sku_item_data(item, shopInfo);
      }),
    };
    analytics.logEvent(firebase.analytics.EventName.VIEW_ITEM_LIST, analyticsData);
  } catch (e) {
    console.log(e);
  }
};
export const sendPurchase = (orderInfo, orderId, menus, shopInfo, restaurantId) => {
  try {
    const analyticsData = {
      transaction_id: orderId,
      affiliation: shopInfo.restaurantName,
      currency: 'JPY',
      value: orderInfo.total,
      tax: orderInfo.tax,
      items: menus.map((item) => {
        return sku_item_data(item, shopInfo);
      }),
    };
    // console.log(analyticsData);
    analytics.logEvent(firebase.analytics.EventName.PURCHASE, analyticsData);
  } catch (e) {
    console.log(e);
  }
};

export const sendRedunded = (orderInfo, orderId, shopInfo, restaurantId) => {
  try {
    const analyticsData = {
      transaction_id: orderId,
      affiliation: shopInfo.restaurantName,
      currency: 'JPY',
      value: orderInfo.total,
      // items: [],
    };
    analytics.logEvent(firebase.analytics.EventName.REFUND, analyticsData);
  } catch (e) {
    console.log(e);
  }
};
