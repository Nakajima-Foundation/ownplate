import * as admin from 'firebase-admin';
import * as utils from '../lib/utils'
import moment from 'moment-timezone';

import i18next from 'i18next'
import { resources } from './resources'

import { ownPlateConfig } from '../common/project';

import * as line from './line'
import * as sms from './sms'
import * as twilio from './twilio';
import * as ses from './ses';

export const sendMessageToCustomer = async (db: FirebaseFirestore.Firestore, lng: string,
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
    // for JP
    await line.sendMessage(db, uidUser, message)
  } else {
    // for others
    await sms.pushSMS("OwnPlate", message, phoneNumber)
  }
}

const createNotifyRestaurantMessage = async (messageId: string, restaurantName: string, orderNumber: number, lng: string) => {
  const t = await i18next.init({
    lng: lng || utils.getStripeRegion().langs[0],
    resources
  })
  const orderName = utils.nameOfOrder(orderNumber);
  const message = `${restaurantName} ${t(messageId)} ${orderName}`;
  return message;
};
const notifyRestaurantToLineUser = async (url: string, message: string, lineUsers: any[]) => {
  const results = await Promise.all(lineUsers.map(async doc => {
    const lineUser = doc.data();
    if (lineUser.notify) {
      await line.sendMessageDirect(doc.id, `${message} ${url}?openExternalBrowser=1`)
    }
    return lineUser;
  }));
  return results;
};
export const notifyRestaurantToRestaurant = async (db: any, messageId: string, restaurantId: string, orderId: string, restaurantName: string, orderNumber: number, lng: string) => {
  const datestr = moment().format("YYYY-MM-DD");
  const restaurant = (await db.doc(`/restaurants/${restaurantId}`).get()).data();
  if (!restaurant) { // paranoia
    return;
  }
  const url = `https://${ownPlateConfig.hostName}/admin/restaurants/${restaurantId}/orders/${orderId}`
  const message = await createNotifyRestaurantMessage(messageId, restaurantName, orderNumber, lng)

  // line push.
  const lineUsers = (await db.collection(`/restaurants/${restaurantId}/lines`).get()).docs;
  if (lineUsers.length > 0) {
    const results = await notifyRestaurantToLineUser(url, message, lineUsers);
    await db.doc(`/restaurants/${restaurantId}/log/${datestr}/lineLog/${orderId}-${messageId}`).set({
      restaurantId,
      date: datestr,
      orderId,
      messageId,
      results,
      updatedAt: admin.firestore.Timestamp.now(),
    });
  }
  
  if (restaurant.mailNofitication) {
    const adminUser = process.env.NODE_ENV === "test" ? {email: process.env.TESTMAIL} : await admin.auth().getUser(restaurant.uid);
    if (adminUser.email) {
      await ses.sendMail(adminUser.email, message, message);
      // console.log(res);
    }
  }
  // notify to web.
  await db.doc(`/admins/${restaurant.uid}/private/notification`).set({
    message,
    sound: true,
    path: `/admin/restaurants/${restaurantId}`,
    updatedAt: admin.firestore.Timestamp.now(),
    url
  })
  // phone notify.
  if (messageId === 'msg_order_placed') {
    if (restaurant.phoneCall) {
      await twilio.phoneCall(restaurant);
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

export const notifyNewOrderToRestaurant = async (db: FirebaseFirestore.Firestore, restaurantId: string, orderId: string, restaurantName: string, orderNumber: number, lng: string) => {
  return notifyRestaurantToRestaurant(db, 'msg_order_placed', restaurantId, orderId, restaurantName, orderNumber, lng)
};

export const notifyCanceledOrderToRestaurant = async (db: FirebaseFirestore.Firestore, restaurantId: string, orderId: string, restaurantName: string, orderNumber: number, lng: string) => {
  return notifyRestaurantToRestaurant(db, 'msg_order_canceled_by_user', restaurantId, orderId, restaurantName, orderNumber, lng)
};
