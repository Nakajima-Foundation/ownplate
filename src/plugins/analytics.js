import firebase from "firebase/app";
import { analytics } from "~/plugins/firebase.js";

// see https://firebase.google.com/docs/analytics/measure-ecommerce

// Event List
// https://firebase.google.com/docs/reference/js/firebase.analytics.EventName

export const sku_item_data = (menu, shopInfo, restaurantId) => {
  return {
    item_id: 'SKU_' + menu.id,
    item_name: menu.itemName,
    item_brand: shopInfo.restaurantName,
    price: menu.price,
    promotion_id: restaurantId,
  };
};
export const sku_item_data2 = (menu, shopInfo, restaurantId, quantity) => {
  return {
    item_id: 'SKU_' + menu.id,
    item_name: menu.itemName,
    item_brand: shopInfo.restaurantName,
    price: menu.price,
    promotion_id: restaurantId,
    quantity,
  };
};

export const sendMenuListView = (menus, shopInfo, restaurantId) => {
  try {
    const analyticsData = {
      item_list_id: restaurantId,
      item_list_name: shopInfo.restaurantName,
      items: menus.map((item) => {
        return sku_item_data(item, shopInfo, restaurantId);
      }),
    };
    analytics.logEvent(firebase.analytics.EventName.VIEW_ITEM_LIST, analyticsData);
  } catch (e) {
    console.log(e);
  }
};

export const sendBeginCheckoout = (price, menus,  shopInfo, restaurantId) => {
  try {
    const analyticsData = {
      currency: 'JPY',
      value: price,
      items: menus.map((item) => {
        return sku_item_data2(item, shopInfo, restaurantId, item.quantity);
      }),
    };
    console.log(analyticsData);
    analytics.logEvent(firebase.analytics.EventName.BEGIN_CHECKOUT, analyticsData);
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
        return sku_item_data(item, shopInfo, restaurantId);
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

// LOGIN

export const sendViewItem = (item, shopInfo, restaurantId) => {
  // is open image
  try {
    const analyticsData = {
      currency: 'JPY',
      value: item.price,
      items: sku_item_data(item, shopInfo, restaurantId),
    };
    analytics.logEvent(firebase.analytics.EventName.VIEW_ITEM, analyticsData);
  } catch (e) {
    console.log(e);
  }
};

export const sendSelectItem = (item, shopInfo, restaurantId) => {
  // is open toggle
  try {
    const analyticsData = {
      items: sku_item_data(item, shopInfo, restaurantId),
    };
    analytics.logEvent(firebase.analytics.EventName.SELECT_ITEM, analyticsData);
  } catch (e) {
    console.log(e);
  }
};

export const sendAddToCart = (item, shopInfo, restaurantId, quantity) => {
  try {
    const analyticsData = {
      currency: 'JPY',
      value: item.price,
      items: sku_item_data2(item, shopInfo, restaurantId, quantity),
    };
    analytics.logEvent(firebase.analytics.EventName.ADD_TO_CART, analyticsData);
  } catch (e) {
    console.log(e);
  }
};

export const sendRemoveFromCart = (item, shopInfo, restaurantId, quantity) => {
  try {
    const analyticsData = {
      currency: 'JPY',
      value: item.price,
      items: sku_item_data2(item, shopInfo, restaurantId, quantity),
    };
    analytics.logEvent(firebase.analytics.EventName.REMOVE_FROM_CART, analyticsData);
  } catch (e) {
    console.log(e);
  }
};

/*
VIEW_CART
ADD_PAYMENT_INFO // input card
*/
