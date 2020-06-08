import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin';
import * as utils from '../lib/utils'
import { order_status } from '../common/constant'
import * as sms from './sms'
import { resources } from './resources'
import i18next from 'i18next'
import Order from '../models/Order'
import * as line from './line'
import { ownPlateConfig } from '../common/project';
import { createCustomer } from '../stripe/customer';

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
  const { restaurantId, orderId, status, lng } = data;
  utils.validate_params({ restaurantId, orderId, status }) // lng is optional

  try {
    const restaurantDoc = await db.doc(`restaurants/${restaurantId}`).get()
    const restaurant = restaurantDoc.data() || {}
    if (restaurant.uid !== uid) {
      throw new functions.https.HttpsError('permission-denied', 'The user does not have an authority to perform this operation.')
    }

    const orderRef = db.doc(`restaurants/${restaurantId}/orders/${orderId}`)
    let phoneNumber: string | undefined = undefined;
    let msgKey: string | undefined = undefined;
    let orderName: string = "";
    let sendSMS: boolean = false;
    let uidUser: string | null = null;

    const result = await db.runTransaction(async transaction => {
      const order = Order.fromSnapshot<Order>(await transaction.get(orderRef))
      if (!order) {
        throw new functions.https.HttpsError('invalid-argument', 'This order does not exist.')
      }
      uidUser = order.uid;
      phoneNumber = order.phoneNumber
      orderName = nameOfOrder(order.number)
      sendSMS = order.sendSMS

      const isPreviousStateChangable: Boolean = (() => {
        switch (order.status) {
          case order_status.order_placed:
          case order_status.order_accepted:
          case order_status.cooking_completed:
            return true
        }
        return false
      })();
      if (!isPreviousStateChangable) {
        throw new functions.https.HttpsError('failed-precondition', 'It is not possible to change state from the current state.', order.status)
      }

      const isNewStatusValid: Boolean = (() => {
        switch (status) {
          //case order_status.order_canceled:    call stripeCancelIntent instead
          case order_status.order_accepted:
            if (status > order.status) {
              msgKey = "msg_order_accepted"
            }
            return true
          case order_status.cooking_completed:
            msgKey = "msg_cooking_completed"
            return true
          case order_status.customer_picked_up:
            return !(order.payment && order.payment.stripe) // only "unpaid" order can be manually completed
        }
        return false
      })();
      if (!isNewStatusValid) {
        throw new functions.https.HttpsError('permission-denied', 'The user does not have an authority to perform this operation.', status)
      }

      if (status === order_status.order_canceled && order.payment && order.payment.stripe) {
        throw new functions.https.HttpsError('permission-denied', 'Paid order can not be cancele like this', status)
      }

      transaction.update(orderRef, {
        updatedAt: admin.firestore.Timestamp.now(),
        status
      })
      return { success: true }
    })
    if (sendSMS && msgKey) {
      await sendMessage(db, lng, msgKey, restaurant.restaurantName, orderName, uidUser, phoneNumber, restaurantId, orderId)
    }
    return result
  } catch (error) {
    throw utils.process_error(error)
  }
}

export const sendMessage = async (db: FirebaseFirestore.Firestore, lng: string,
  msgKey: string, restaurantName: string, orderNumber: string,
  uidUser: string | null, phoneNumber: string | undefined,
  restaurantId: string, orderId: string) => {
  const t = await i18next.init({
    lng: lng || utils.getStripeRegion().langs[0],
    resources
  })
  const url = `https://${ownPlateConfig.hostName}/r/${restaurantId}/order/${orderId}?openExternalBrowser=1`
  const message = `${t(msgKey)} ${restaurantName} ${orderNumber} ${url}`;
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
  const url = `https://${ownPlateConfig.hostName}/admin/restaurants/${restaurantId}/orders/${orderId}?openExternalBrowser=1`
  const orderName = nameOfOrder(orderNumber);
  const message = `${t(messageId)} ${orderName} ${url}`;
  docs.forEach(async doc => {
    const lineUser = doc.data();
    if (lineUser.notify) {
      await line.sendMessageDirect(doc.id, message)
    }
  });
}

export const notifyNewOrder = async (db: FirebaseFirestore.Firestore, restaurantId: string, orderId: string, orderNumber: number, lng: string) => {
  notifyRestaurant(db, 'msg_order_placed', restaurantId, orderId, orderNumber, lng)
};

export const notifyCanceledOrder = async (db: FirebaseFirestore.Firestore, restaurantId: string, orderId: string, orderNumber: number, lng: string) => {
  notifyRestaurant(db, 'msg_order_canceled_by_user', restaurantId, orderId, orderNumber, lng)
};

export const getMenuObj = async (refRestaurant) => {
  const menuObj = {};
  const menusCollections = await refRestaurant.collection("menus").get();
  menusCollections.forEach((m) => {
    menuObj[m.id] = m.data();
  });
  return menuObj;
};

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
    const alcoholTax = restaurantData.alcoholTax || 0;
    const foodTax = restaurantData.foodTax || 0;

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

      if (menu.tax === "alcohol") {
        alcohol_sub_total += (menu.price * num);
      } else {
        food_sub_total += (menu.price * num)
      }
      newOrderData[menuId] = num;
      newItems[menuId] = { price: menu.price, itemName: menu.itemName };
    });

    const multiple = utils.getStripeRegion().multiple; //100 for USD, 1 for JPY
    // calculate price.
    const sub_total = food_sub_total + alcohol_sub_total;
    if (sub_total === 0) {
      throw new Error("invalid order: total 0 ");
    }
    const tax = Math.round(((alcohol_sub_total * alcoholTax) / 100 + (food_sub_total * foodTax) / 100) * multiple) / multiple;
    const total = sub_total + tax;

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
      total
    });
  } catch (e) {
    console.log(e);
    return orderRef.update("status", order_status.error);

  }
}
