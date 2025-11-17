import * as admin from "firebase-admin";
import * as functions from "firebase-functions/v1";
import * as utils from "../../lib/utils";
import { order_status, stripe_regions_jp } from "../../common/constant";
import { createCustomer } from "../stripe/customer";

import { OrderCreatedData } from "../../models/functionTypes";
import { OrderData, OptionValue } from "../../lib/types/order";
import { RestaurantInfoData } from "../../models/RestaurantInfo";
import { MenuData, MenuItem } from "../../models/menu";
import { validateOrderCreated } from "../../lib/validator";
import { Context } from "../../models/TestType";

const getOptionPrice = (selectedOptionsRaw: OptionValue[], menu: MenuData, multiple: number) => {
  return selectedOptionsRaw.reduce((tmpPrice: number, selectedOpt: OptionValue, key: number) => {
    const opt = menu.itemOptionCheckbox[key].split(",");
    if (opt.length === 1) {
      if (selectedOpt) {
        return tmpPrice + Math.round(utils.optionPrice(opt[0]) * multiple) / multiple;
      }
    } else {
      const optIndex = typeof selectedOpt === "number" ? selectedOpt : Number(selectedOpt);
      return tmpPrice + Math.round(utils.optionPrice(opt[optIndex]) * multiple) / multiple;
    }
    return tmpPrice;
  }, 0);
};

export const orderAccounting = (restaurantData: RestaurantInfoData, food_sub_total: number, alcohol_sub_total: number, multiple: number) => {
  // tax rate
  const inclusiveTax = restaurantData.inclusiveTax || false;
  const alcoholTax = restaurantData.alcoholTax || 0;
  const foodTax = restaurantData.foodTax || 0;

  // calculate price.
  const sub_total = food_sub_total + alcohol_sub_total;
  if (sub_total === 0) {
    throw new Error("invalid order: total 0 ");
  }
  if (inclusiveTax) {
    const food_tax = Math.round(food_sub_total * (1 - 1 / (1 + foodTax / 100)) * multiple) / multiple;
    const alcohol_tax = Math.round(alcohol_sub_total * (1 - 1 / (1 + alcoholTax / 100)) * multiple) / multiple;
    const tax = food_tax + alcohol_tax;
    return {
      tax,
      inclusiveTax,
      sub_total,
      total: sub_total,
      food_sub_total: food_sub_total - food_tax,
      food_tax,
      alcohol_sub_total: alcohol_sub_total - alcohol_tax,
      alcohol_tax,
    };
  } else {
    const food_tax = Math.round(((food_sub_total * foodTax) / 100) * multiple) / multiple;
    const alcohol_tax = Math.round(((alcohol_sub_total * alcoholTax) / 100) * multiple) / multiple;
    const tax = food_tax + alcohol_tax;

    const total = sub_total + tax;
    return {
      tax,
      inclusiveTax,
      sub_total,
      total,
      food_sub_total,
      food_tax,
      alcohol_sub_total,
      alcohol_tax,
    };
  }
};

// restaurantData is for mo.
export const createNewOrderData = async (
  restaurantRef: admin.firestore.DocumentReference,
  orderRef: admin.firestore.DocumentReference,
  orderData: Partial<OrderData> & { order: { [menuId: string]: number | number[] }; rawOptions?: { [menuId: string]: OptionValue[][] } },
  multiple: number,
): Promise<
  | { result: true, data: { newOrderData: { [menuId: string]: number[] }; newItems: { [menuId: string]: MenuItem }; newPrices: { [menuId: string]: number[] }; food_sub_total: number; alcohol_sub_total: number }}
  | { result: false }
> => {
  const menuIds = Object.keys(orderData.order);
  const menuObj = await utils.getMenuObj(restaurantRef, menuIds);

  // ret
  const newOrderData: { [menuId: string]: number[] } = {};
  const newItems: { [menuId: string]: MenuItem } = {};
  const newPrices: { [menuId: string]: number[] } = {};

  let food_sub_total = 0;
  let alcohol_sub_total = 0;
  // end of ret

  if (
    menuIds.some((menuId) => {
      return menuObj[menuId] === undefined;
    })
  ) {
    console.error("[createNewOrderData] menuError");
    await orderRef.update("status", order_status.error);
    return { result: false };
  }

  menuIds.map((menuId) => {
    const menu = menuObj[menuId] as MenuData;

    if (menu.soldOut) {
      return;
    }

    const prices: number[] = [];
    const newOrder: number[] = [];

    const orderItem = orderData.order[menuId];
    const numArray = Array.isArray(orderItem) ? orderItem : [orderItem];
    numArray.map((num, orderKey) => {
      if (!Number.isInteger(num)) {
        throw new Error("invalid number: not integer");
      }
      if (num < 0) {
        throw new Error("invalid number: negative number");
      }
      if (num === 0) {
        return;
      }
      const rawOptions = orderData.rawOptions?.[menuId]?.[orderKey];
      const price = menu.price + (rawOptions ? getOptionPrice(rawOptions, menu, multiple) : 0);
      newOrder.push(num);
      prices.push(price * num);
    });
    newPrices[menuId] = prices;
    newOrderData[menuId] = newOrder;

    const total = prices.reduce((sum, price) => sum + price, 0);
    if (menu.tax === "alcohol") {
      alcohol_sub_total += total;
    } else {
      food_sub_total += total;
    }
    const menuItem: MenuItem = {
      price: menu.price,
      itemName: menu.itemName,
      itemPhoto: menu.itemPhoto,
      images: menu.images,
      itemAliasesName: menu.itemAliasesName || "",
      category1: menu.category1 || "",
      category2: menu.category2 || "",
      exceptDay: menu.exceptDay || {},
      exceptHour: menu.exceptHour || {},
      tax: menu.tax || "",
    };

    newItems[menuId] = menuItem;
  });
  return {
    result: true,
    data: {
      newOrderData,
      newItems,
      newPrices,
      food_sub_total,
      alcohol_sub_total,
    },
  };
};

export const orderCreated = async (db: admin.firestore.Firestore, data: OrderCreatedData, context: functions.https.CallableContext | Context) => {
  const customerUid = utils.validate_customer_auth(context);

  const { restaurantId, orderId } = data;
  utils.required_params({ restaurantId, orderId });

  const validateResult = validateOrderCreated(data);
  if (!validateResult.result) {
    console.error("orderCreated", validateResult.errors);
    throw new functions.https.HttpsError("invalid-argument", "Validation Error.");
  }

  const restaurantRef = db.doc(`restaurants/${restaurantId}`);
  const orderRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}`);

  try {
    const restaurantDoc = await restaurantRef.get();
    if (!restaurantDoc.exists) {
      console.error("[orderCreated] noRestaurant");
      return orderRef.update("status", order_status.error);
    }
    const restaurantData = restaurantDoc.data() as RestaurantInfoData;
    if (!restaurantData) {
      console.error("[orderCreated] noRestaurant");
      return orderRef.update("status", order_status.error);
    }

    if (restaurantData.deletedFlag || !restaurantData.publicFlag) {
      console.error("[orderCreated] not exists");
      return orderRef.update("status", order_status.error);
    }
    const order = await orderRef.get();

    if (!order) {
      throw new functions.https.HttpsError("invalid-argument", "This order does not exist.");
    }
    const orderData = order.data() as OrderData | undefined;

    if (!orderData || !orderData.status || orderData.status !== order_status.new_order || !orderData.uid || orderData.uid !== customerUid) {
      console.log("invalid order:" + String(orderId));
      throw new functions.https.HttpsError("invalid-argument", "This order does not exist.");
    }

    // validate
    const ownerUid = restaurantData.uid;
    const { isDelivery, isLiff, lunchOrDinner } = orderData;
    if (isDelivery && !restaurantData.enableDelivery) {
      throw new functions.https.HttpsError("invalid-argument", "Invalid delivery order.");
    }
    if (isLiff && !restaurantData.supportLiff) {
      throw new functions.https.HttpsError("invalid-argument", "Invalid liff order.");
    }
    if (restaurantData.enableLunchDinner) {
      if (!lunchOrDinner || !["lunch", "dinner"].includes(lunchOrDinner)) {
        throw new functions.https.HttpsError("invalid-argument", "Invalid lunch dinner order.");
      }
    } else {
      if (lunchOrDinner) {
        throw new functions.https.HttpsError("invalid-argument", "Invalid lunch dinner order.");
      }
    }

    const multiple = stripe_regions_jp.multiple; //100 for USD, 1 for JPY

    const res = await createNewOrderData(restaurantRef, orderRef, orderData, multiple);
    if (!res.result) {
      throw new functions.https.HttpsError("permission-denied", "unknown error.");
    }
    const { newOrderData, newItems, newPrices, food_sub_total, alcohol_sub_total } = res.data;

    // Atomically increment the orderCount of the restaurant
    let orderCount = 0;
    await db.runTransaction(async (tr) => {
      // We need to read restaurantData again for this transaction
      const trRestaurantData = (await tr.get(restaurantRef)).data();
      if (trRestaurantData) {
        orderCount = trRestaurantData.orderCount || 0;
        await tr.update(restaurantRef, {
          orderCount: (orderCount + 1) % 1000000,
        });
      }
    });

    const accountingResult = orderAccounting(restaurantData, food_sub_total, alcohol_sub_total, multiple);

    const deliveryData = orderData.isDelivery ? await utils.get_restaurant_delivery_area(db, restaurantId) : {};
    const deliveryFee = utils.get_delivery_cost(orderData, deliveryData, accountingResult.total);

    await createCustomer(db, customerUid, context.auth?.token?.phone_number || "");

    // just copy original data.
    const { options, rawOptions, uid, phoneNumber, name, updatedAt, timeCreated } = orderData;

    await orderRef.set(
      utils.filterData({
        // copy and validate
        isDelivery,
        isLiff,

        lunchOrDinner,

        // just copy
        options,
        rawOptions,
        uid,
        phoneNumber,
        name,
        updatedAt,
        timeCreated,
        // end of copy

        ownerUid,
        order: newOrderData,
        menuItems: newItems, // Clone of ordered menu items (simplified)
        prices: newPrices,
        status: order_status.validation_ok,
        number: orderCount,
        sub_total: accountingResult.sub_total,
        tax: accountingResult.tax,
        inclusiveTax: accountingResult.inclusiveTax,
        deliveryFee,
        total: accountingResult.total,
        accounting: {
          food: {
            revenue: accountingResult.food_sub_total,
            tax: accountingResult.food_tax,
          },
          alcohol: {
            revenue: accountingResult.alcohol_sub_total,
            tax: accountingResult.alcohol_tax,
          },
        },
      }),
    );
    return { result: true };
  } catch (e) {
    console.error("[orderCreated] unknown ", e);
    return orderRef.update("status", order_status.error);
  }
};
