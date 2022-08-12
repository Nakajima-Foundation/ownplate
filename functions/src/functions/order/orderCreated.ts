import * as functions from "firebase-functions";
import * as utils from "../../lib/utils";
import { order_status } from "../../common/constant";
import { createCustomer } from "../../stripe/customer";

// export const wasOrderCreated = async (db, snapshot, context) => {
export const getGroupRestautantRef = async (db, groupId: string) => {
  const groupData = (await db.doc(`groups/${groupId}`).get()).data();
  if (!groupData) {
    throw new functions.https.HttpsError("invalid-argument", "This group does not exist.");
  }
  return db.doc(`restaurants/${groupData.restaurantId}`);
};

// for wasOrderCreated
const getOptionPrice = (selectedOptionsRaw, menu, multiple) => {
  return selectedOptionsRaw.reduce((tmpPrice, selectedOpt, key) => {
    const opt = menu.itemOptionCheckbox[key].split(",");
    if (opt.length === 1) {
      if (selectedOpt) {
        return tmpPrice + Math.round(utils.optionPrice(opt[0]) * multiple) / multiple;
      }
    } else {
      return tmpPrice + Math.round(utils.optionPrice(opt[selectedOpt]) * multiple) / multiple;
    }
    return tmpPrice;
  }, 0);
};

export const orderAccounting = (restaurantData, food_sub_total, alcohol_sub_total, multiple) => {
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


export const createNewOrderData = async (restaurantRef, orderRef, orderData, multiple) => {
  const menuIds = Object.keys(orderData.order);
  const menuObj = await utils.getMenuObj(restaurantRef, menuIds);

  // ret
  const newOrderData = {};
  const newItems = {};
  const newPrices = {};

  let food_sub_total = 0;
  let alcohol_sub_total = 0;
  // end of ret

  if (
    menuIds.some((menuId) => {
      return menuObj[menuId] === undefined;
    })
  ) {
    console.error("[createNewOrderData] menuError");
    return orderRef.update("status", order_status.error);
  }
  menuIds.map((menuId) => {
    const menu = menuObj[menuId];
    if (menu.soldOut) {
      return;
    }

    const prices: number[] = [];
    const newOrder: number[] = [];

    const numArray = Array.isArray(orderData.order[menuId]) ? orderData.order[menuId] : [orderData.order[menuId]];
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
      const price = menu.price + getOptionPrice(orderData.rawOptions[menuId][orderKey], menu, multiple);
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
    const menuItem: any = {
      price: menu.price,
      itemName: menu.itemName,
      itemPhoto: menu.itemPhoto,
      images: menu.images,
      itemAliasesName: menu.itemAliasesName,
      category1: menu.category1,
      category2: menu.category2,
      category: menu.category,
      subCategory: menu.subCategory,
      productId: menu.productId,
      tax: menu.tax,
    };

    newItems[menuId] = utils.filterData(menuItem);
  });
  return {
    newOrderData,
    newItems,
    newPrices,
    food_sub_total,
    alcohol_sub_total,
  };
};

export const wasOrderCreated = async (db, data: any, context) => {
  const customerUid = utils.validate_auth(context);

  const { restaurantId, orderId } = data;
  utils.validate_params({ restaurantId, orderId });

  const restaurantRef = db.doc(`restaurants/${restaurantId}`);
  const orderRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}`);

  try {
    const restaurantDoc = await restaurantRef.get();
    if (!restaurantDoc.exists) {
      console.error("[wasOrderCreated] noRestaurant");
      return orderRef.update("status", order_status.error);
    }
    const restaurantData = restaurantDoc.data();

    if (restaurantData.deletedFlag || !restaurantData.publicFlag) {
      console.error("[wasOrderCreated] not exists");
      return orderRef.update("status", order_status.error);
    }
    // check mo
    const menuRestaurantRef = restaurantData.groupId ? await getGroupRestautantRef(db, restaurantData.groupId) : restaurantRef;

    const order = await orderRef.get();

    if (!order) {
      throw new functions.https.HttpsError("invalid-argument", "This order does not exist.");
    }
    const orderData = order.data();

    if (!orderData || !orderData.status || orderData.status !== order_status.new_order || !orderData.uid || orderData.uid !== customerUid) {
      console.log("invalid order:" + String(orderId));
      throw new functions.https.HttpsError("invalid-argument", "This order does not exist.");
    }
    const multiple = utils.getStripeRegion().multiple; //100 for USD, 1 for JPY

    const { newOrderData, newItems, newPrices, food_sub_total, alcohol_sub_total } = await createNewOrderData(menuRestaurantRef, orderRef, orderData, multiple);

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

    await createCustomer(db, customerUid, context.auth.token.phone_number);

    return orderRef.update(
      utils.filterData({
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
        groupId: restaurantData.groupId,
      })
    );
  } catch (e) {
    console.error("[wasOrderCreated] unknown ", e);
    return orderRef.update("status", order_status.error);
  }
};
