import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin';
import * as utils from '../lib/utils'
import {
  order_status, possible_transitions,
  order_status_keys, timeEventMapping
} from '../common/constant'
import Order from '../models/Order'
import { createCustomer } from '../stripe/customer';
import moment from 'moment-timezone';

import { sendMessageToCustomer, notifyNewOrderToRestaurant } from './notify';

import { Context } from '../models/TestType'



export const updateOrderTotalData = async (db, transaction, order, restaurantId, ownerUid, timePlaced, positive) => {
  const timezone =  functions.config() && functions.config().order && functions.config().order.timezone || "Asia/Tokyo";

  const menuIds = Object.keys(order);
  const date = moment(timePlaced.toDate()).tz(timezone).format('YYYYMMDD');
  
  await Promise.all(menuIds.map(async (menuId) => {
    const numArray = Array.isArray(order[menuId]) ? order[menuId] : [order[menuId]];
    const num = numArray.reduce((sum, current) => {
      return sum + current
    }, 0);
    const path = `restaurants/${restaurantId}/menus/${menuId}/orderTotal/${date}`
    const totalRef = db.doc(path)
    const total = (await transaction.get(totalRef)).data();
    
    if (!total) {
      const addData = {
        uid: ownerUid,
        restaurantId,
        menuId,
        date,
        count: num,
      };
      await transaction.set(totalRef, addData);
    } else {
      const count = positive ? total.count + num : total.count - num;
      const updateData = {
        count,
      };
      await transaction.update(totalRef, updateData);
    }
  }));
};

// This function is called by users to place orders without paying
// export const place = async (db: FirebaseFirestore.Firestore, data: any, context: functions.https.CallableContext) => {
 export const place = async (db, data: any, context: functions.https.CallableContext | Context) => {
  const uid = utils.validate_auth(context);
  const { restaurantId, orderId, tip, sendSMS, timeToPickup, lng, memo } = data;
  utils.validate_params({ restaurantId, orderId }) // tip, sendSMS and lng are optinoal
  let order: Order | undefined = undefined;

  try {
    const restaurantData = await utils.get_restaurant(db, restaurantId);
    const orderRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}`)

    const result = await db.runTransaction(async transaction => {
      order = (await transaction.get(orderRef)).data();
      if (!order) {
        throw new functions.https.HttpsError('invalid-argument', 'This order does not exist.')
      }
      order.id = orderId;
      if (uid !== order.uid) {
        throw new functions.https.HttpsError('permission-denied', 'The user is not the owner of this order.')
      }
      if (order.status !== order_status.validation_ok) {
        throw new functions.https.HttpsError('failed-precondition', 'The order has been already placed or canceled')
      }
      const multiple = utils.getStripeRegion().multiple; // 100 for USD, 1 for JPY
      const roundedTip = Math.round(tip * multiple) / multiple

      // transaction for stock orderTotal
      const timePlaced = timeToPickup && new admin.firestore.Timestamp(timeToPickup.seconds, timeToPickup.nanoseconds) || admin.firestore.FieldValue.serverTimestamp()
      await updateOrderTotalData(db, transaction, order.order, restaurantId, restaurantData.uid, timePlaced, true);
      
      transaction.update(orderRef, {
        status: order_status.order_placed,
        totalCharge: order.total + tip,
        tip: roundedTip,
        sendSMS: sendSMS || false,
        updatedAt: admin.firestore.Timestamp.now(),
        orderPlacedAt: admin.firestore.Timestamp.now(),
        timePlaced,
        memo: memo || "",
      })
      // order.totalCharge = order.total + tip;
      return { success: true }
    })
    
    await notifyNewOrderToRestaurant(db, restaurantId, order, restaurantData.restaurantName, lng);

    return result;
  } catch (error) {
    throw utils.process_error(error)
  }
}

// This function is called by admins (restaurant operators) to update the status of order
export const update = async (db: FirebaseFirestore.Firestore, data: any, context: functions.https.CallableContext) => {
  const uid = utils.validate_auth(context);
  const { restaurantId, orderId, status, lng, timezone, timeEstimated } = data;
  utils.validate_params({ restaurantId, orderId, status, timezone }) // lng, timeEstimated is optional

  try {
    const restaurantDoc = await db.doc(`restaurants/${restaurantId}`).get()
    const restaurant = restaurantDoc.data() || {}
    if (restaurant.uid !== uid) {
      throw new functions.https.HttpsError('permission-denied', 'The user does not have an authority to perform this operation.')
    }

    const orderRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}`)
    let order: Order | undefined = undefined;
    let msgKey: string | undefined = undefined;

    const result = await db.runTransaction(async transaction => {
      order = Order.fromSnapshot<Order>(await transaction.get(orderRef))
      order.id = orderId;
      if (!order) {
        throw new functions.https.HttpsError('invalid-argument', 'This order does not exist.')
      }

      const possible_transition = possible_transitions[order.status];
      if (!possible_transition[status]) {
        throw new functions.https.HttpsError('failed-precondition', 'It is not possible to change state from the current state.', order.status)
      }

      if (status === order_status.order_accepted) {
        msgKey = "msg_order_accepted"
      }
      if (status === order_status.ready_to_pickup) {
        if (order && order.timeEstimated) {
          const diffDay =  (moment().toDate().getTime() - order.timeEstimated.toDate().getTime()) / 1000 / 3600 / 24;
          console.log("timeEstimated_diff_days = " + String(diffDay)); 
          if (diffDay < 1) {
            msgKey = "msg_cooking_completed"
          }
        }
      }
      if (status === order_status.order_canceled && order.payment && order.payment.stripe) {
        throw new functions.https.HttpsError('permission-denied', 'Paid order can not be cancele like this', status)
      }

      // everything are ok
      const updateTimeKey = timeEventMapping[order_status_keys[status]];

      const props: any = {
        updatedAt: admin.firestore.Timestamp.now(),
        status,
        [updateTimeKey]: admin.firestore.Timestamp.now(),
      };
      if (status === order_status.order_accepted) {
        props.timeEstimated = timeEstimated ?
          new admin.firestore.Timestamp(timeEstimated.seconds, timeEstimated.nanoseconds)
          : order.timePlaced;
        order.timeEstimated = props.timeEstimated;
      }
      transaction.update(orderRef, props)
      return { success: true }
    })

    if (order!.sendSMS && msgKey) {
      const params = {}
      if (status === order_status.order_accepted) {
        params["time"] = moment(order!.timeEstimated!.toDate()).tz(timezone).locale('ja').format('LLL');
        console.log("timeEstimated", params["time"]);
      }
      const orderName = utils.nameOfOrder(order!.number)
      // To customer
      await sendMessageToCustomer(db, lng, msgKey, restaurant.restaurantName, orderName, order!.uid, order!.phoneNumber, restaurantId, orderId, params)
    }
    return result
  } catch (error) {
    throw utils.process_error(error)
  }
}

// export const wasOrderCreated = async (db, snapshot, context) => {
export const wasOrderCreated = async (db, data: any, context) => {
  const uid = utils.validate_auth(context);

  const { restaurantId, orderId } = data;
  utils.validate_params({ restaurantId, orderId });

  const restaurantRef = db.doc(`restaurants/${restaurantId}`)
  const orderRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}`)

  try {
    const restaurantDoc = await restaurantRef.get();
    if (!restaurantDoc.exists) {
      return orderRef.update("status", order_status.error);
    }
    const restaurantData = restaurantDoc.data();

    if (restaurantData.deletedFlag || !restaurantData.publicFlag) {
      return orderRef.update("status", order_status.error);
    }

    const order = await orderRef.get();

    if (!order) {
      throw new functions.https.HttpsError('invalid-argument', 'This order does not exist.')
    }
    const orderData = order.data()

    if (!orderData || !orderData.status || orderData.status !== order_status.new_order ||
      !orderData.uid || orderData.uid !== uid) {
      console.log("invalid order:" + String(orderId));
      throw new functions.https.HttpsError('invalid-argument', 'This order does not exist.')
    }

    // tax rate
    const inclusiveTax = restaurantData.inclusiveTax || false;
    const alcoholTax = restaurantData.alcoholTax || 0;
    const foodTax = restaurantData.foodTax || 0;
    const multiple = utils.getStripeRegion().multiple; //100 for USD, 1 for JPY

    const menuIds = Object.keys(orderData.order);
    const menuObj = await utils.getMenuObj(restaurantRef, menuIds);

    let food_sub_total = 0;
    let alcohol_sub_total = 0;

    const newOrderData = {};
    const newItems = {};
    const newPrices = {};
    if (menuIds.some((menuId) => {
      return menuObj[menuId] === undefined;
    })) {
      return orderRef.update("status", order_status.error);
    }
    menuIds.map((menuId) => {
      newOrderData[menuId] = [];
      newItems[menuId] = {};
      newPrices[menuId] = [];
      
      const menu = menuObj[menuId];

      const numArray = Array.isArray(orderData.order[menuId]) ? orderData.order[menuId] : [orderData.order[menuId]];
      numArray.map((num, orderKey) => {
        //const num = orderData.order[menuId];
        if (!Number.isInteger(num)) {
          throw new Error("invalid number: not integer");
        }
        if (num < 0) {
          throw new Error("invalid number: negative number");
        }
        // skip 0 order
        if (num === 0) {
          return;
        }

        const selectedOptionsRaw = orderData.rawOptions[menuId][orderKey];
        const price = selectedOptionsRaw.reduce((tmpPrice, selectedOpt, key) => {
          const opt = menu.itemOptionCheckbox[key].split(",");
          if (opt.length === 1) {
            if (selectedOpt) {
              return tmpPrice + Math.round(utils.optionPrice(opt[0]) * multiple) / multiple;
            }
          } else {
            return tmpPrice + Math.round(utils.optionPrice(opt[selectedOpt]) * multiple) / multiple;
          }
          return tmpPrice;
        }, menu.price);
        
        if (menu.tax === "alcohol") {
          alcohol_sub_total += (price * num);
        } else {
          food_sub_total += (price * num)
        }
        newOrderData[menuId].push(num);
        newPrices[menuId].push(price * num);
      });
      const menuItem: any = { price: menu.price, itemName: menu.itemName };
      if (menu.category1) {
        menuItem.category1 = menu.category1;
      }
      if (menu.category2) {
        menuItem.category2 = menu.category2;
      }
      newItems[menuId] = menuItem;
    });
    
    // calculate price.
    const sub_total = food_sub_total + alcohol_sub_total;
    if (sub_total === 0) {
      throw new Error("invalid order: total 0 ");
    }
    let food_tax = Math.round(food_sub_total * foodTax / 100 * multiple) / multiple;
    let alcohol_tax = Math.round(alcohol_sub_total * alcoholTax / 100 * multiple) / multiple;
    let tax = food_tax + alcohol_tax;
    let total = sub_total + tax;
    if (inclusiveTax) {
      food_tax = Math.round((food_sub_total * (1 - 1 / (1 + foodTax / 100))) * multiple) / multiple;
      alcohol_tax = Math.round((alcohol_sub_total * (1 - 1 / (1 + alcoholTax / 100))) * multiple) / multiple;
      tax = food_tax + alcohol_tax;
      food_sub_total -= food_tax;
      alcohol_sub_total -= alcohol_tax;
      total = sub_total;
    }

    // Atomically increment the orderCount of the restaurant
    let orderCount = 0;
    await db.runTransaction(async (tr) => {
      // We need to read restaurantData again for this transaction
      const trRestaurantData = (await tr.get(restaurantRef)).data();
      if (trRestaurantData) {
        orderCount = trRestaurantData.orderCount || 0;
        await tr.update(restaurantRef, {
          orderCount: (orderCount + 1) % 1000000
        });
      }
    });
    await createCustomer(db, uid, context.auth.token.phone_number)

    return orderRef.update({
      order: newOrderData,
      menuItems: newItems, // Clone of ordered menu items (simplified)
      prices: newPrices,
      status: order_status.validation_ok,
      number: orderCount,
      sub_total,
      tax,
      inclusiveTax,
      total,
      accounting: {
        food: {
          revenue: food_sub_total, tax: food_tax
        },
        alcohol: {
          revenue: alcohol_sub_total, tax: alcohol_tax
        }
      }
    });
  } catch (e) {
    console.log(e);
    return orderRef.update("status", order_status.error);

  }
}
