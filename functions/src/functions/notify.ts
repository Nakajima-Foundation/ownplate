import * as functions from "firebase-functions";
import * as firebase from "firebase-admin";
import * as utils from "../lib/utils";
import moment from "moment-timezone";

import * as fs from "fs";

import i18next from "i18next";
import { resources, resources_mo } from "./resources";

import { ownPlateConfig } from "../common/project";

import * as line from "./line";
import * as sms from "./sms";
import * as twilio from "./twilio";
import * as ses from "./ses";

const LINE_MESSAGE_TOKEN = (functions.config() && functions.config().line && functions.config().line.message_token) || process.env.LINE_MESSAGE_TOKEN;

const aws_key = (functions.config() && functions.config().aws && functions.config().aws.id) || process.env.AWS_ID;
const aws_secret = (functions.config() && functions.config().aws && functions.config().aws.secret) || process.env.AWS_SECRET;

export const isEnabled = !!ownPlateConfig.line;

// for customer
export const sendMessageToCustomer = async (
  db: firebase.firestore.Firestore,
  lng: string,
  msgKey: string,
  restaurantName: string,
  orderData: firebase.firestore.DocumentData,
  restaurantId: string,
  orderId: string,
  params: object = {},
  forceSMS: boolean = false
) => {
  const orderNumber = utils.nameOfOrder(orderData.number);

  const t = await i18next.init({
    lng: lng || utils.getStripeRegion().langs[0],
    resources: orderData.groupId ? resources_mo : resources,
  });
  const getMessage = (_url: string) => {
    const message = `${t(msgKey, params)} ${restaurantName} ${orderNumber} ${_url}`;
    return message;
  };
  const url = `https://${ownPlateConfig.hostName}/r/${restaurantId}/order/${orderId}?openExternalBrowser=1`;

  // Not JP
  if (!isEnabled) {
    return await sms.pushSMS(aws_key, aws_secret, "OwnPlate", getMessage(url), orderData.phoneNumber);
  }
  // for JP Mobile Order
  if (orderData.groupId && !/11111111$/.test(orderData.phoneNumber)) {
    const { groupId } = orderData;
    const groupUrl = `https://${ownPlateConfig.hostName}/${groupId}/r/${restaurantId}/order/${orderId}?openExternalBrowser=1`;

    const yearstr = moment().format("YYYY");
    const monthstr = moment().format("YYYY-MM");
    const datestr = moment().format("YYYY-MM-DD");
    try {
      db.collection(`log/smsLog/sms${yearstr}/sms${datestr}/${groupId}SmsLogData`).add({
        restaurantId,
        orderId,
        groupId,
        date: datestr,
        uid: orderData.uid,
        month: monthstr,
        last4: orderData.phoneNumber.slice(-4),
        createdAt: process.env.NODE_ENV !== "test" ? firebase.firestore.Timestamp.now() : Date.now(),
      });
    } catch (e) {
      console.log(e);
    }

    return await sms.pushSMS(aws_key, aws_secret, "Mobile Order", getMessage(groupUrl), orderData.phoneNumber);
  }
  // for JP
  const { lineId, liffIndexId, liffId } = (await line.getLineId(db, orderData.uid)) as any;

  if (lineId) {
    if (liffIndexId) {
      // liff
      const { token } = await line.getLiffPrivateConfig(db, liffIndexId);
      if (token) {
        const liffUrl = `https://liff.line.me/${liffId}/r/${restaurantId}/order/${orderId}`;
        await line.sendMessageDirect(lineId, getMessage(liffUrl), token);
      }
    } else {
      await line.sendMessageDirect(lineId, getMessage(url), LINE_MESSAGE_TOKEN);
    }
  }
  // force SMS ( for cancel and change order)
  if (forceSMS && orderData.phoneNumber) {
    await sms.pushSMS(aws_key, aws_secret, "omochikaeri", getMessage(url), orderData.phoneNumber);
  }
};

// for restaurant
const createNotifyRestaurantLineMessage = async (messageId: string, restaurantName: string, orderNumber: number, lng: string) => {
  const t = await i18next.init({
    lng: lng || utils.getStripeRegion().langs[0],
    resources,
  });
  const orderName = utils.nameOfOrder(orderNumber);
  const message = `${t(messageId)} ${orderName} ${restaurantName}`;
  return message;
};

const createNotifyRestaurantMailTitle = async (messageId: string, restaurantName: string, orderNumber: number, lng: string) => {
  const t = await i18next.init({
    lng: lng || utils.getStripeRegion().langs[0],
    resources,
  });
  const orderName = utils.nameOfOrder(orderNumber);
  const message = `${t(messageId)} ${orderName} ${restaurantName}`;
  return message;
};

export const createNotifyRestaurantMailMessage = async (messageId: string, restaurantName: string, order: any, orderNumber: number, _lng: string, url: string) => {
  const lng = _lng || utils.getStripeRegion().langs[0];
  const path = `./mail_templates/${messageId}/${lng}.html`;
  const template_data = fs.readFileSync(path, { encoding: "utf8" });

  const t = await i18next.init({
    lng: lng || utils.getStripeRegion().langs[0],
    resources,
  });

  const orderName = utils.nameOfOrder(orderNumber);
  const orders = Object.keys(order.order)
    .map((menuId) => {
      const menu = order.menuItems[menuId];
      const name = menu.itemName;
      return Object.keys(order.order[menuId])
        .map((key) => {
          const count = order.order[menuId][key];
          const messages: string[] = [];
          messages.push(`★ ${name} × ${count}`);

          try {
            if (order.options && order.options[menuId] && order.options[menuId][key]) {
              const opts = order.options[menuId][key].filter((o) => o);
              if (opts.length > 0) {
                messages.push(t("option") + ": " + opts.join("/"));
              }
            }
          } catch (e) {
            console.log(e);
          }

          return messages.join("\n");
        })
        .join("\n\n");
    })
    .join("\n\n");
  const data = {
    restaurantName,
    orderName,
    orders,
    totalCharge: order.totalCharge,
    payment: t(order.payment ? "card_payment" : "payment_in_store"),
    url,
  };
  const replacedTemp = Object.keys(data).reduce((tmp, key) => {
    const regex = new RegExp("\\${" + key + "}", "g");
    return tmp.replace(regex, data[key]);
  }, template_data);

  // const message = `${restaurantName} ${t(messageId)} ${orderName} ${JSON.stringify(order)}`;
  return replacedTemp;
};

const notifyRestaurantToLineUser = async (url: string, message: string, lineUsers: any[]) => {
  const results = await Promise.all(
    lineUsers.map(async (doc) => {
      const lineUser = doc.data();
      if (lineUser.notify) {
        await line.sendMessageDirect(doc.id, `${message} ${url}?openExternalBrowser=1`, LINE_MESSAGE_TOKEN);
      }
      return lineUser;
    })
  );
  return results;
};

export const notifyRestaurant = async (db: any, messageId: string, restaurantId: string, order: any, restaurantName: string, lng: string) => {
  const datestr = moment().format("YYYY-MM-DD");
  const restaurant = (await db.doc(`/restaurants/${restaurantId}`).get()).data();
  if (!restaurant) {
    // paranoia
    return;
  }
  const orderId = order.id;
  const orderNumber = order.number;

  const url = `https://${ownPlateConfig.hostName}/admin/restaurants/${restaurantId}/orders/${orderId}`;
  const lineMessage = await createNotifyRestaurantLineMessage(messageId, restaurantName, orderNumber, lng);
  const mailTitle = await createNotifyRestaurantMailTitle(messageId, restaurantName, orderNumber, lng);
  const mailMessage = await createNotifyRestaurantMailMessage(messageId, restaurantName, order, orderNumber, lng, url);

  // line push.
  const lineUsers = (await db.collection(`/restaurants/${restaurantId}/lines`).get()).docs;
  if (lineUsers.length > 0) {
    const results = await notifyRestaurantToLineUser(url, lineMessage, lineUsers);
    await db.doc(`/restaurants/${restaurantId}/log/${datestr}/lineLog/${orderId}-${messageId}`).set({
      restaurantId,
      date: datestr,
      orderId,
      messageId,
      results,
      updatedAt: process.env.NODE_ENV !== "test" ? firebase.firestore.Timestamp.now() : Date.now(),
    });
  }

  if (restaurant.emailNotification) {
    const adminUser = process.env.NODE_ENV === "test" ? { email: process.env.TESTMAIL } : await firebase.auth().getUser(restaurant.uid);
    console.log(adminUser.email);
    if (adminUser.email) {
      await ses.sendMail(adminUser.email, mailTitle, mailMessage);
      // console.log(res);
    }
  }
  // notify to web.
  await db.doc(`/admins/${restaurant.uid}/private/notification`).set({
    lineMessage,
    sound: true,
    path: `/admin/restaurants/${restaurantId}`,
    updatedAt: process.env.NODE_ENV !== "test" ? firebase.firestore.Timestamp.now() : Date.now(),
    url,
  });

  // phone notify.
  if (messageId === "msg_order_placed") {
    if (restaurant.phoneCall) {
      await twilio.phoneCall(restaurant);
      await db.doc(`/restaurants/${restaurantId}/log/${datestr}/phoneLog/${orderId}`).set({
        restaurantId,
        date: datestr,
        orderId,
        phoneNumber: restaurant.phoneNumber,
        updatedAt: process.env.NODE_ENV !== "test" ? firebase.firestore.Timestamp.now() : Date.now(),
      });
    }
  }
};

export const notifyNewOrderToRestaurant = async (db: firebase.firestore.Firestore, restaurantId: string, order: any, restaurantName: string, lng: string) => {
  return notifyRestaurant(db, "msg_order_placed", restaurantId, order, restaurantName, lng);
};

export const notifyCanceledOrderToRestaurant = async (db: firebase.firestore.Firestore, restaurantId: string, order: any, restaurantName: string, lng: string) => {
  return notifyRestaurant(db, "msg_order_canceled_by_user", restaurantId, order, restaurantName, lng);
};
