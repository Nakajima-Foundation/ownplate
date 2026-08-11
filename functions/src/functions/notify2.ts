import * as admin from "firebase-admin";
import { defineSecret } from "firebase-functions/params";
import moment from "moment-timezone";

import * as fs from "fs";

import i18next from "i18next";
import { resources } from "./resources";
import * as utils from "../lib/utils";
import { MenuData } from "../models/menu";
import { RestaurantInfoData } from "../models/RestaurantInfo";
import { stripe_regions_jp } from "../common/constant";
import { ownPlateConfig } from "../common/project";
import { getLineId, getLiffPrivateConfig } from "./line/line";

import { sendMessageDirect } from "./notify/line";
import * as sms from "./notify/sms";
import * as twilio from "./notify/twilio";
import * as ses from "./notify/ses";
import { isWebPushConfigured, restaurantNotifyUids, sendWebPush } from "./notify/webpush";
import { createWebPushPayload } from "./notify/webpushFormat";

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
  params: Record<string, string | number> = {},
  forceSMS: boolean = false,
) => {
  const orderNumber = utils.nameOfOrder(orderData.number);

  const t = await i18next.init({
    lng: stripe_regions_jp.langs[0],
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
  const { lineId, liffIndexId, liffId } = (await getLineId(db, orderData.uid));

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
const createNotifyRestaurantSubject = async (messageId: string, orderNumber: number, lng: string) => {
  const t = await i18next.init({
    lng: lng || stripe_regions_jp.langs[0],
    resources,
  });
  const orderName = utils.nameOfOrder(orderNumber);
  return `${t(messageId)} ${orderName}`;
};

export const createNotifyRestaurantMailMessage = async (messageId: string, restaurantName: string, order: admin.firestore.DocumentData, orderNumber: number, _lng: string, url: string) => {
  const lng = _lng || stripe_regions_jp.langs[0];
  const path = `./mail_templates/${messageId}/${lng}.html`;
  const template_data = fs.readFileSync(path, { encoding: "utf8" });

  const t = await i18next.init({
    lng,
    resources,
  });

  const orderName = utils.nameOfOrder(orderNumber);
  const orders = Object.keys(order.order)
    .map((menuId) => {
      const menu = order.menuItems[menuId] as MenuData;
      const name = menu.itemName;
      return Object.keys(order.order[menuId])
        .map((key) => {
          const count = order.order[menuId][key];
          const messages: string[] = [];
          messages.push(`★ ${name} × ${count}`);

          try {
            if (order.options && order.options[menuId] && order.options[menuId][key]) {
              const opts = order.options[menuId][key].filter((o: string) => o);
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
  const data: Record<string, string> = {
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

type WebPushParams = {
  restaurantId: string;
  ownerUid: string;
  orderId: string;
  messageId: string;
  restaurantName: string;
  subject: string;
  datestr: string;
};

const sendRestaurantWebPush = async (db: admin.firestore.Firestore, params: WebPushParams) => {
  const { restaurantId, ownerUid, orderId, messageId, restaurantName, subject, datestr } = params;
  const uids = await restaurantNotifyUids(db, ownerUid, restaurantId);
  const payload = createWebPushPayload(subject, restaurantName, restaurantId, orderId);
  const result = await sendWebPush(db, uids, payload);
  if (result.total === 0) {
    return;
  }
  await db.doc(`/restaurants/${restaurantId}/log/${datestr}/webPushLog/${orderId}-${messageId}`).set({
    restaurantId,
    date: datestr,
    orderId,
    messageId,
    sent: result.sent,
    total: result.total,
    updatedAt: process.env.NODE_ENV !== "test" ? admin.firestore.FieldValue.serverTimestamp() : Date.now(),
  });
};

// push の失敗が LINE / メール / 電話の通知や注文処理そのものを巻き込まないようにする
const notifyRestaurantByWebPush = async (db: admin.firestore.Firestore, params: WebPushParams) => {
  if (!isWebPushConfigured()) {
    return;
  }
  try {
    await sendRestaurantWebPush(db, params);
  } catch (e) {
    console.error("notifyRestaurantByWebPush failed", e);
  }
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

export const notifyRestaurant = async (db: admin.firestore.Firestore, messageId: string, restaurantId: string, order: admin.firestore.DocumentData, restaurantName: string) => {
  const lng = stripe_regions_jp.langs[0];
  const datestr = moment().format("YYYY-MM-DD");
  const restaurant = (await db.doc(`/restaurants/${restaurantId}`).get()).data() as RestaurantInfoData;
  if (!restaurant) {
    // paranoia
    return;
  }
  const orderId = order.id;
  const orderNumber = order.number;

  const url = `https://${ownPlateConfig.hostName}/admin/restaurants/${restaurantId}/orders/${orderId}`;
  const subject = await createNotifyRestaurantSubject(messageId, orderNumber, lng);
  const notifyMessage = `${subject} ${restaurantName}`;
  const mailMessage = await createNotifyRestaurantMailMessage(messageId, restaurantName, order, orderNumber, lng, url);

  // line push.
  const lineUsers = (await db.collection(`/restaurants/${restaurantId}/lines`).get()).docs;
  if (lineUsers.length > 0) {
    const results = await notifyRestaurantToLineUser(url, notifyMessage, lineUsers);
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
      await ses.sendMail(adminUser.email, notifyMessage, mailMessage);
      // console.log(res);
    }
  }
  // notify to web.
  await db.doc(`/admins/${restaurant.uid}/private/notification`).set({
    lineMessage: notifyMessage,
    sound: true,
    path: `/admin/restaurants/${restaurantId}`,
    updatedAt: process.env.NODE_ENV !== "test" ? admin.firestore.FieldValue.serverTimestamp() : Date.now(),
    url,
  });

  // web push. (管理画面を閉じている端末向け)
  await notifyRestaurantByWebPush(db, {
    restaurantId,
    ownerUid: restaurant.uid,
    orderId,
    messageId,
    restaurantName,
    subject,
    datestr,
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

export const notifyNewOrderToRestaurant = async (db: admin.firestore.Firestore, restaurantId: string, order: admin.firestore.DocumentData, restaurantName: string) => {
  return notifyRestaurant(db, "msg_order_placed", restaurantId, order, restaurantName);
};

export const notifyCanceledOrderToRestaurant = async (db: admin.firestore.Firestore, restaurantId: string, order: admin.firestore.DocumentData, restaurantName: string) => {
  return notifyRestaurant(db, "msg_order_canceled_by_user", restaurantId, order, restaurantName);
};
