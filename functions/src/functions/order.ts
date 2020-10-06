import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin';
import * as utils from '../lib/utils'
import { order_status, possible_transitions } from '../common/constant'
import * as sms from './sms'
import { resources } from './resources'
import i18next from 'i18next'
import Order from '../models/Order'
import * as line from './line'
import { ownPlateConfig } from '../common/project';
import { createCustomer } from '../stripe/customer';
import moment from 'moment-timezone';

import * as twilio from './twilio';

export const nameOfOrder = (orderNumber: number) => {
  return "#" + `00${orderNumber}`.slice(-3);
};

// This function is called by users to place orders without paying
export const place = async (db: FirebaseFirestore.Firestore, data: any, context: functions.https.CallableContext) => {
  const uid = utils.validate_auth(context);
  const { restaurantId, orderId, tip, sendSMS, timeToPickup, lng } = data;
  utils.validate_params({ restaurantId, orderId }) // tip, sendSMS and lng are optinoal

  try {
    const orderRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}`)

    let orderNumber: number = 0;
    const result = await db.runTransaction(async transaction => {
      const order = Order.fromSnapshot<Order>(await transaction.get(orderRef))
      if (!order) {
        throw new functions.https.HttpsError('invalid-argument', 'This order does not exist.')
      }
      orderNumber = order.number;
      if (uid !== order.uid) {
        throw new functions.https.HttpsError('permission-denied', 'The user is not the owner of this order.')
      }
      if (order.status !== order_status.validation_ok) {
        throw new functions.https.HttpsError('failed-precondition', 'The order has been already placed or canceled')
      }
      const multiple = utils.getStripeRegion().multiple; // 100 for USD, 1 for JPY
      const roundedTip = Math.round(tip * multiple) / multiple

      transaction.update(orderRef, {
        status: order_status.order_placed,
        totalCharge: order.total + tip,
        tip: roundedTip,
        sendSMS: sendSMS || false,
        updatedAt: admin.firestore.Timestamp.now(),
        orderPlacedAt: admin.firestore.Timestamp.now(),
        timePlaced: timeToPickup && new admin.firestore.Timestamp(timeToPickup.seconds, timeToPickup.nanoseconds) || admin.firestore.FieldValue.serverTimestamp(),
      })

      return { success: true }
    })
    await notifyNewOrder(db, restaurantId, orderId, orderNumber, lng);

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
      if (!order) {
        throw new functions.https.HttpsError('invalid-argument', 'This order does not exist.')
      }

      const possible_transition = possible_transitions[order.status];
      if (!possible_transition[status]) {
        throw new functions.https.HttpsError('failed-precondition', 'It is not possible to change state from the current state.', order.status)
      }

      if (status == order_status.order_accepted) {
        msgKey = "msg_order_accepted"
      }

      if (status === order_status.order_canceled && order.payment && order.payment.stripe) {
        throw new functions.https.HttpsError('permission-denied', 'Paid order can not be cancele like this', status)
      }

      // everything are ok
      const props: any = {
        updatedAt: admin.firestore.Timestamp.now(),
        status
      };
      if (status === order_status.order_accepted) {
        props.timeEstimated = timeEstimated ?
          new admin.firestore.Timestamp(timeEstimated.seconds, timeEstimated.nanoseconds)
          : order.timePlaced;
        props.orderAcceptedAt = admin.firestore.Timestamp.now();
        order.timeEstimated = props.timeEstimated;
      }
      if (status === order_status.transaction_complete) {
        props.transactionCompletedAt = admin.firestore.Timestamp.now();
      }
      if (status === order_status.ready_to_pickup) {
        // Make it compatible with striped orders.
        props.orderCustomerPickedUpAt = admin.firestore.Timestamp.now();
        props.timeConfirmed = props.updatedAt;
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
      const orderName = nameOfOrder(order!.number)
      await sendMessage(db, lng, msgKey, restaurant.restaurantName, orderName, order!.uid, order!.phoneNumber, restaurantId, orderId, params)
    }
    return result
  } catch (error) {
    throw utils.process_error(error)
  }
}

export const sendMessage = async (db: FirebaseFirestore.Firestore, lng: string,
  msgKey: string, restaurantName: string, orderNumber: string,
  uidUser: string | null, phoneNumber: string | undefined,
  restaurantId: string, orderId: string, params: object = {}) => {
  const t = await i18next.init({
    lng: lng || utils.getStripeRegion().langs[0],
    resources
  })
  const url = `https://${ownPlateConfig.hostName}/r/${restaurantId}/order/${orderId}?openExternalBrowser=1`
  const message = `${t(msgKey, params)} ${restaurantName} ${orderNumber} ${url}`;
  if (line.isEnabled) {
    await line.sendMessage(db, uidUser, message)
  } else {
    await sms.pushSMS("OwnPlate", message, phoneNumber)
  }
}

const notifyRestaurant = async (db: FirebaseFirestore.Firestore, messageId: string, restaurantId: string, orderId: string, orderNumber: number, lng: string) => {
  const docs = (await db.collection(`/restaurants/${restaurantId}/lines`).get()).docs;
  const t = await i18next.init({
    lng: lng || utils.getStripeRegion().langs[0],
    resources
  })
  const url = `https://${ownPlateConfig.hostName}/admin/restaurants/${restaurantId}/orders/${orderId}`
  const orderName = nameOfOrder(orderNumber);
  const message = `${t(messageId)} ${orderName}`;
  docs.forEach(async doc => {
    const lineUser = doc.data();
    if (lineUser.notify) {
      await line.sendMessageDirect(doc.id, `${message} ${url}?openExternalBrowser=1`)
    }
  });

  const restaurant = (await db.doc(`/restaurants/${restaurantId}`).get()).data();
  if (restaurant) { // paranoia
    await db.doc(`/admins/${restaurant.uid}/private/notification`).set({
      message,
      sound: true,
      path: `/admin/restaurants/${restaurantId}`,
      updatedAt: admin.firestore.Timestamp.now(),
      url
    })
    // todo make phone call
    if (messageId === 'msg_order_placed') {
      if (restaurant.phoneCall) {
        await twilio.phoneCall(restaurant);
        const datestr = moment().format("YYYY-MM-DD");
        await db.doc(`/restaurants/${restaurantId}/log/${datestr}/phoneLog/${orderId}`).set({
          restaurantId,
          date: datestr,
          orderId,
          phoneNumber: restaurant.phoneNumber,
          updatedAt: admin.firestore.Timestamp.now(),
        });
      }
    }
  }
}

export const notifyNewOrder = async (db: FirebaseFirestore.Firestore, restaurantId: string, orderId: string, orderNumber: number, lng: string) => {
  return notifyRestaurant(db, 'msg_order_placed', restaurantId, orderId, orderNumber, lng)
};

export const notifyCanceledOrder = async (db: FirebaseFirestore.Firestore, restaurantId: string, orderId: string, orderNumber: number, lng: string) => {
  return notifyRestaurant(db, 'msg_order_canceled_by_user', restaurantId, orderId, orderNumber, lng)
};

export const getMenuObj = async (refRestaurant) => {
  const menuObj = {};
  const menusCollections = await refRestaurant.collection("menus").get();
  menusCollections.forEach((m) => {
    menuObj[m.id] = m.data();
  });
  return menuObj;
};

const regex = /\(\+[0-9\.]+\)/
const optionPrice = (option: string) => {
  const match = option.match(regex);
  if (match) {
    return Number(match[0].slice(1, -1))
  }
  return 0;
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
    let restaurantData = restaurantDoc.data();

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
      console.log("invalid order:" + String(order.id));
      throw new functions.https.HttpsError('invalid-argument', 'This order does not exist.')
    }

    // tax rate
    const inclusiveTax = restaurantData.inclusiveTax || false;
    const alcoholTax = restaurantData.alcoholTax || 0;
    const foodTax = restaurantData.foodTax || 0;
    const multiple = utils.getStripeRegion().multiple; //100 for USD, 1 for JPY

    const menuObj = await getMenuObj(restaurantRef);

    let food_sub_total = 0;
    let alcohol_sub_total = 0;

    const newOrderData = {};
    const newItems = {};
    Object.keys(orderData.order).map((menuId) => {
      const num = orderData.order[menuId];
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
      const menu = menuObj[menuId];
      let price = menu.price;
      const options = orderData.options[menuId];
      options.forEach(option => {
        price += Math.round(optionPrice(option) * multiple) / multiple;
      });

      if (menu.tax === "alcohol") {
        alcohol_sub_total += (price * num);
      } else {
        food_sub_total += (price * num)
      }
      newOrderData[menuId] = num;
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
    let number = 0;
    await db.runTransaction(async (tr) => {
      // We need to read restaurantData again for this transaction
      restaurantData = (await restaurantRef.get()).data();
      if (restaurantData) {
        number = restaurantData.orderCount || 0;
        await tr.update(restaurantRef, {
          orderCount: (number + 1) % 1000000
        });
      }
    });
    await createCustomer(db, uid, context.auth.token.phone_number)

    return orderRef.update({
      order: newOrderData,
      menuItems: newItems, // Clone of ordered menu items (simplified)
      status: order_status.validation_ok,
      number,
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
