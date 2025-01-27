import * as admin from "firebase-admin";
import { defineSecret } from "firebase-functions/params";
import moment from "moment-timezone";

import * as fs from "fs";

import i18next from "i18next";
import { resources } from "./resources";
import * as utils from "../lib/utils";

import { ownPlateConfig } from "../common/project";
import { getLineId, getLiffPrivateConfig } from "./line/line2";

import { sendMessageDirect } from "./notify2/line";
import * as sms from "./notify2/sms";
import * as twilio from "./notify2/twilio";
import * as ses from "./notify2/ses";

const LINE_MESSAGE_TOKEN = defineSecret("LINE_MESSAGE_TOKEN");

// for customer
export const sendMessageToCustomer = async (
  db: admin.firestore.Firestore,
  msgKey: string,
  hasLine: boolean,
  restaurantName: string,
  orderData: admin.firestore.DocumentData,
  restaurantId: string,
  orderId: string,
  params: Record<string, any> = {},
  forceSMS: boolean = false,
) => {
  const orderNumber = utils.nameOfOrder(orderData.number);

  const t = await i18next.init({
    lng: utils.stripeRegion.langs[0],
    resources,
  });
  const getMessage = (_url: string) => {
    const message = `${t(msgKey, params)} ${restaurantName} ${orderNumber} ${_url}`;
    return message;
  };
  const url = `https://${ownPlateConfig.hostName}/r/${restaurantId}/order/${orderId}?openExternalBrowser=1`;

  // for JP restaurant push
  if (hasLine) {
    const config = await utils.get_restaurant_line_config(db, restaurantId);
    const lineUser = await utils.get_restaurant_line_user(db, restaurantId, orderData.uid);

    const uidLine = lineUser?.profile?.userId;
    const token = config?.message_token;
    if (uidLine && token) {
      await sendMessageDirect(uidLine, getMessage(url), token);
      return;
    }
  }

  // for JP
  const { lineId, liffIndexId, liffId } = (await getLineId(db, orderData.uid)) as any;

  if (lineId) {
    if (liffIndexId) {
      // liff
      const { token } = await getLiffPrivateConfig(db, liffIndexId);
      if (token) {
        const liffUrl = `https://liff.line.me/${liffId}/r/${restaurantId}/order/${orderId}`;
        await sendMessageDirect(lineId, getMessage(liffUrl), token);
      }
    } else {
      await sendMessageDirect(lineId, getMessage(url), LINE_MESSAGE_TOKEN.value());
    }
  }
  // force SMS ( for cancel and change order)
  if (forceSMS && orderData.phoneNumber) {
    await sms.pushSMS("omochikaeri", getMessage(url), orderData.phoneNumber);
  }
};

// for restaurant
const createNotifyRestaurantLineMessage = async (messageId: string, restaurantName: string, orderNumber: number, lng: string) => {
  const t = await i18next.init({
    lng: lng || utils.stripeRegion.langs[0],
    resources,
  });
  const orderName = utils.nameOfOrder(orderNumber);
  const message = `${t(messageId)} ${orderName} ${restaurantName}`;
  return message;
};

const createNotifyRestaurantMailTitle = async (messageId: string, restaurantName: string, orderNumber: number, lng: string) => {
  const t = await i18next.init({
    lng: lng || utils.stripeRegion.langs[0],
    resources,
  });
  const orderName = utils.nameOfOrder(orderNumber);
  const message = `${t(messageId)} ${orderName} ${restaurantName}`;
  return message;
};

export const createNotifyRestaurantMailMessage = async (messageId: string, restaurantName: string, order: any, orderNumber: number, _lng: string, url: string) => {
  const lng = _lng || utils.stripeRegion.langs[0];
  const path = `./mail_templates/${messageId}/${lng}.html`;
  const template_data = fs.readFileSync(path, { encoding: "utf8" });

  const t = await i18next.init({
    lng,
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

const notifyRestaurantToLineUser = async (url: string, message: string, lineUsers: admin.firestore.DocumentSnapshot[]) => {
  const results = await Promise.all(
    lineUsers.map(async (doc) => {
      const lineUser = doc.data();
      if (lineUser && lineUser.notify) {
        await sendMessageDirect(doc.id, `${message} ${url}?openExternalBrowser=1`, LINE_MESSAGE_TOKEN.value());
      }
      return lineUser;
    }),
  );
  return results;
};

export const notifyRestaurant = async (db: admin.firestore.Firestore | any, messageId: string, restaurantId: string, order: any, restaurantName: string) => {
  const lng = utils.stripeRegion.langs[0];
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
      updatedAt: process.env.NODE_ENV !== "test" ? admin.firestore.FieldValue.serverTimestamp() : Date.now(),
    });
  }

  if (restaurant.emailNotification) {
    const adminUser = process.env.NODE_ENV === "test" ? { email: process.env.TESTMAIL } : await admin.auth().getUser(restaurant.uid);
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
    updatedAt: process.env.NODE_ENV !== "test" ? admin.firestore.FieldValue.serverTimestamp() : Date.now(),
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
        updatedAt: process.env.NODE_ENV !== "test" ? admin.firestore.FieldValue.serverTimestamp() : Date.now(),
      });
    }
  }
};

export const notifyNewOrderToRestaurant = async (db: admin.firestore.Firestore, restaurantId: string, order: any, restaurantName: string) => {
  return notifyRestaurant(db, "msg_order_placed", restaurantId, order, restaurantName);
};

export const notifyCanceledOrderToRestaurant = async (db: admin.firestore.Firestore, restaurantId: string, order: any, restaurantName: string) => {
  return notifyRestaurant(db, "msg_order_canceled_by_user", restaurantId, order, restaurantName);
};
