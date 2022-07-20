import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as utils from "../lib/utils";
import { order_status, possible_transitions, order_status_keys, timeEventMapping } from "../common/constant";
import { createCustomer } from "../stripe/customer";
import moment from "moment-timezone";
import { costCal } from "../common/commonUtils";

import { sendMessageToCustomer, notifyNewOrderToRestaurant } from "./notify";

import { Context } from "../models/TestType";

export const updateOrderTotalDataAndUserLog = async (db, transaction, customerUid, order, restaurantId, ownerUid, timePlaced, positive) => {
  const timezone = (functions.config() && functions.config().order && functions.config().order.timezone) || "Asia/Tokyo";

  const menuIds = Object.keys(order);
  const date = moment(timePlaced.toDate()).tz(timezone).format("YYYYMMDD");

  // Firestore transactions require all reads to be executed before all writes.

  // Read !!
  const totalRef: { [key: string]: any } = {};
  const totals: { [key: string]: any } = {};
  const nums: { [key: string]: number } = {};
  await Promise.all(
    menuIds.map(async (menuId) => {
      const numArray = Array.isArray(order[menuId]) ? order[menuId] : [order[menuId]];
      nums[menuId] = numArray.reduce((sum, current) => {
        return sum + current;
      }, 0);
      const path = `restaurants/${restaurantId}/menus/${menuId}/orderTotal/${date}`;
      totalRef[menuId] = db.doc(path);
      totals[menuId] = (await transaction.get(totalRef[menuId])).data();
    })
  );

  const userLogPath = `restaurants/${restaurantId}/userLog/${customerUid}`;
  const userLogRef = db.doc(userLogPath);
  const userLog = (await transaction.get(userLogRef)).data();

  // Write!!
  await Promise.all(
    menuIds.map(async (menuId) => {
      const num = nums[menuId];
      const total = totals[menuId];
      if (!total) {
        const addData = {
          uid: ownerUid,
          restaurantId,
          menuId,
          date,
          count: num,
        };
        await transaction.set(totalRef[menuId], addData);
      } else {
        const count = positive ? total.count + num : total.count - num;
        const updateData = {
          count,
        };
        await transaction.update(totalRef[menuId], updateData);
      }
    })
  );
  if (!userLog) {
    const data = {
      uid: customerUid,
      counter: positive ? 1 : 0,
      cancelCounter: positive ? 0 : 1,
      currentOrder: timePlaced,
      // lastOrder: timePlaced,
      restaurantId,
      ownerUid,
    };
    await transaction.set(userLogRef, data);
  } else {
    const counter = userLog.counter + (positive ? 1 : 0);
    const cancelCounter = userLog.cancelCounter + (positive ? 0 : 1);
    const updateData = {
      counter,
      cancelCounter,
      currentOrder: timePlaced,
      lastOrder: userLog.currentOrder || timePlaced,
    };
    await transaction.update(userLogRef, updateData);
  }
};

// This function is called by users to place orders without paying
// export const place = async (db: admin.firestore.Firestore, data: any, context: functions.https.CallableContext) => {
export const place = async (db, data: any, context: functions.https.CallableContext | Context) => {
  const customerUid = utils.validate_auth(context);
  const { restaurantId, orderId, tip, sendSMS, timeToPickup, lng, memo, customerInfo } = data;
  const _tip = Number(tip) || 0;
  utils.validate_params({ restaurantId, orderId }); // tip, sendSMS and lng are optinoal

  const timePlaced = (timeToPickup && new admin.firestore.Timestamp(timeToPickup.seconds, timeToPickup.nanoseconds)) || admin.firestore.FieldValue.serverTimestamp();
  try {
    const restaurantData = await utils.get_restaurant(db, restaurantId);
    const orderRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}`);
    const customerRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}/customer/data`);

    const postage = restaurantData.isEC ? await utils.get_restaurant_postage(db, restaurantId) : {};

    const result = await db.runTransaction(async (transaction) => {
      const order = (await transaction.get(orderRef)).data();
      if (!order) {
        throw new functions.https.HttpsError("invalid-argument", "This order does not exist.");
      }
      order.id = orderId;
      if (customerUid !== order.uid) {
        throw new functions.https.HttpsError("permission-denied", "The user is not the owner of this order.");
      }
      if (order.status !== order_status.validation_ok) {
        throw new functions.https.HttpsError("failed-precondition", "The order has been already placed or canceled");
      }
      const hasCustomer = restaurantData.isEC || order.isDelivery;

      const multiple = utils.getStripeRegion().multiple; // 100 for USD, 1 for JPY
      const roundedTip = Math.round(_tip * multiple) / multiple;

      if (hasCustomer) {
        // for transaction lock
        await transaction.get(customerRef);
      }
      // transaction for stock orderTotal
      await updateOrderTotalDataAndUserLog(db, transaction, customerUid, order.order, restaurantId, restaurantData.uid, timePlaced, true);
      const shippingCost = restaurantData.isEC ? costCal(postage, customerInfo?.prefectureId, order.total) : 0;

      if (hasCustomer) {
        await transaction.set(customerRef, {
          ...customerInfo,
          uid: customerUid,
          orderId,
          restaurantId,
          createdAt: admin.firestore.Timestamp.now(),
        });
      }
      // customerUid
      await transaction.update(orderRef, {
        status: order_status.order_placed,
        totalCharge: order.total + _tip + (shippingCost || 0),
        tip: roundedTip,
        shippingCost,
        sendSMS: sendSMS || false,
        updatedAt: admin.firestore.Timestamp.now(),
        orderPlacedAt: admin.firestore.Timestamp.now(),
        timePlaced,
        memo: memo || "",
        isEC: restaurantData.isEC || false,
        // customerInfo: customerInfo || {},
      });
      Object.assign(order, { totalCharge: order.total + _tip + (shippingCost || 0), tip, shippingCost });
      return { success: true, order };
    });

    await notifyNewOrderToRestaurant(db, restaurantId, result.order, restaurantData.restaurantName, lng);

    return result;
  } catch (error) {
    throw utils.process_error(error);
  }
};

// This function is called by admins (restaurant operators) to update the status of order
export const update = async (db: admin.firestore.Firestore, data: any, context: functions.https.CallableContext) => {
  const ownerUid = utils.validate_admin_auth(context);
  const { restaurantId, orderId, status, lng, timezone, timeEstimated } = data;
  utils.validate_params({ restaurantId, orderId, status, timezone }); // lng, timeEstimated is optional

  try {
    const restaurantDoc = await db.doc(`restaurants/${restaurantId}`).get();
    const restaurant = restaurantDoc.data() || {};
    if (restaurant.uid !== ownerUid) {
      throw new functions.https.HttpsError("permission-denied", "The user does not have an authority to perform this operation.");
    }

    const orderRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}`);
    let msgKey: string | undefined = undefined;

    const result = await db.runTransaction(async (transaction) => {
      const order = (await transaction.get(orderRef)).data();
      if (!order) {
        throw new functions.https.HttpsError("invalid-argument", "This order does not exist.");
      }
      order.id = orderId;

      const possible_transition = possible_transitions[order.status];
      if (!possible_transition[status]) {
        throw new functions.https.HttpsError("failed-precondition", "It is not possible to change state from the current state.", order.status);
      }

      if (status === order_status.order_canceled && order.payment && order.payment.stripe) {
        throw new functions.https.HttpsError("permission-denied", "Paid order can not be cancele like this", status);
      }
      if (
        (order.status === order_status.ready_to_pickup || order.status === order_status.order_accepted) &&
        order.payment &&
        order.payment.stripe &&
        order.payment &&
        order.payment.stripe === "pending"
      ) {
        throw new functions.https.HttpsError("permission-denied", "Paid order can not be change like this", status);
      }

      if (status === order_status.order_accepted) {
        msgKey = order.isEC ? "msg_ec_order_accepted" : "msg_order_accepted";
      }
      if (status === order_status.ready_to_pickup) {
        if (order.isEC) {
          msgKey = "msg_ec_cooking_completed";
        } else {
          if (order && order.timeEstimated) {
            const diffDay = (moment().toDate().getTime() - order.timeEstimated.toDate().getTime()) / 1000 / 3600 / 24;
            console.log("timeEstimated_diff_days = " + String(diffDay));
            if (diffDay < 1) {
              msgKey = "msg_cooking_completed";
            }
          }
        }
      }

      // everything are ok
      const updateTimeKey = timeEventMapping[order_status_keys[status]];
      const updateData: any = {
        status,
        updatedAt: admin.firestore.Timestamp.now(),
        [updateTimeKey]: admin.firestore.Timestamp.now(),
      };
      if (status === order_status.order_accepted) {
        updateData.timeEstimated = timeEstimated ? new admin.firestore.Timestamp(timeEstimated.seconds, timeEstimated.nanoseconds) : order.timePlaced;
        order.timeEstimated = updateData.timeEstimated;
      }
      await transaction.update(orderRef, updateData);
      return { success: true, order };
    });

    const orderData = result.order;
    // sendSMS is always true
    if (orderData.sendSMS && msgKey) {
      const params = {};
      if (status === order_status.order_accepted) {
        params["time"] = moment(orderData.timeEstimated.toDate()).tz(timezone).locale("ja").format("LLL");
        console.log("timeEstimated", params["time"]);
      }
      await sendMessageToCustomer(db, lng, msgKey, restaurant.restaurantName, orderData, restaurantId, orderId, params);
    }
    return result;
  } catch (error) {
    throw utils.process_error(error);
  }
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

const getGroupRestautantRef = async (db, groupId: string) => {
  const groupData = (await db.doc(`groups/${groupId}`).get()).data();
  if (!groupData) {
    throw new functions.https.HttpsError("invalid-argument", "This group does not exist.");
  }
  return db.doc(`restaurants/${groupData.restaurantId}`);
};
// export const wasOrderCreated = async (db, snapshot, context) => {
export const wasOrderCreated = async (db, data: any, context) => {
  const customerUid = utils.validate_auth(context);

  const { restaurantId, orderId } = data;
  utils.validate_params({ restaurantId, orderId });

  const restaurantRef = db.doc(`restaurants/${restaurantId}`);
  const orderRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}`);

  try {
    const restaurantDoc = await restaurantRef.get();
    if (!restaurantDoc.exists) {
      return orderRef.update("status", order_status.error);
    }
    const restaurantData = restaurantDoc.data();

    if (restaurantData.deletedFlag || !restaurantData.publicFlag) {
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

    return orderRef.update(utils.filterData({
      order: newOrderData,
      menuItems: newItems, // Clone of ordered menu items (simplified)
      prices: newPrices,
      status: order_status.validation_ok,
      number: orderCount,
      sub_total: accountingResult.sub_total,
      tax: accountingResult.tax,
      inclusiveTax: accountingResult.inclusiveTax,
      deliveryFee,
      total: accountingResult.total + deliveryFee,
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
    }));
  } catch (e) {
    console.log(e);
    return orderRef.update("status", order_status.error);
  }
};
