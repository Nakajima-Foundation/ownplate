import * as admin from "firebase-admin";
import * as utils from "../lib/utils";
import moment from "moment-timezone";

import * as fs from "fs";

import i18next from "i18next";
import { resources } from "./resources";

import { ownPlateConfig } from "../common/project";

import * as line from "./line";
import * as sms from "./sms";
import * as twilio from "./twilio";
import * as ses from "./ses";

// for customer
export const sendMessageToCustomer = async (
  db: FirebaseFirestore.Firestore,
  lng: string,
  msgKey: string,
  restaurantName: string,
  orderNumber: string,
  uidUser: string | null,
  phoneNumber: string | undefined,
  restaurantId: string,
  orderId: string,
  params: object = {}
) => {
  const t = await i18next.init({
    lng: lng || utils.getStripeRegion().langs[0],
    resources
  });
  const url = `https://${ownPlateConfig.hostName}/r/${restaurantId}/order/${orderId}?openExternalBrowser=1`;
  const message = `${t(
    msgKey,
    params
  )} ${restaurantName} ${orderNumber} ${url}`;
  if (line.isEnabled) {
    // for JP
    await line.sendMessage(db, uidUser, message);
  } else {
    // for others
    await sms.pushSMS("OwnPlate", message, phoneNumber);
  }
};

// for restaurant
const createNotifyRestaurantLineMessage = async (
  messageId: string,
  restaurantName: string,
  orderNumber: number,
  lng: string
) => {
  const t = await i18next.init({
    lng: lng || utils.getStripeRegion().langs[0],
    resources
  });
  const orderName = utils.nameOfOrder(orderNumber);
  const message = `${t(messageId)} ${orderName} ${restaurantName}`;
  return message;
};

const createNotifyRestaurantMailTitle = async (
  messageId: string,
  restaurantName: string,
  orderNumber: number,
  lng: string
) => {
  const t = await i18next.init({
    lng: lng || utils.getStripeRegion().langs[0],
    resources
  });
  const orderName = utils.nameOfOrder(orderNumber);
  const message = `${t(messageId)} ${orderName} ${restaurantName}`;
  return message;
};

const createNotifyRestaurantMailMessage = async (
  messageId: string,
  restaurantName: string,
  order: any,
  orderNumber: number,
  _lng: string,
  url: string
) => {
  const lng = _lng || utils.getStripeRegion().langs[0];
  const path = `./mail_templates/${messageId}/${lng}.html`;
  const template_data = fs.readFileSync(path, { encoding: "utf8" });

  const orderName = utils.nameOfOrder(orderNumber);
  const orders = Object.keys(order.order)
    .map(menuId => {
      const menu = order.menuItems[menuId];
      const name = menu.itemName;
      const count = order.order[menuId].reduce((sum, ele) => sum + ele, 0);
      return `${name} × ${count}`;
    })
    .join("\n");
  const data = {
    restaurantName,
    orderName,
    orders,
    // totalCharge: order.total,
    url
  };
  const replacedTemp = Object.keys(data).reduce((tmp, key) => {
    const regex = new RegExp("\\${" + key + "}", "g");
    return tmp.replace(regex, data[key]);
  }, template_data);

  // const message = `${restaurantName} ${t(messageId)} ${orderName} ${JSON.stringify(order)}`;
  return replacedTemp;
};

const notifyRestaurantToLineUser = async (
  url: string,
  message: string,
  lineUsers: any[]
) => {
  const results = await Promise.all(
    lineUsers.map(async doc => {
      const lineUser = doc.data();
      if (lineUser.notify) {
        await line.sendMessageDirect(
          doc.id,
          `${message} ${url}?openExternalBrowser=1`
        );
      }
      return lineUser;
    })
  );
  return results;
};

export const notifyRestaurant = async (
  db: any,
  messageId: string,
  restaurantId: string,
  order: any,
  restaurantName: string,
  lng: string
) => {
  const datestr = moment().format("YYYY-MM-DD");
  const restaurant = (
    await db.doc(`/restaurants/${restaurantId}`).get()
  ).data();
  if (!restaurant) {
    // paranoia
    return;
  }
  const orderId = order.id;
  const orderNumber = order.number;

  const url = `https://${ownPlateConfig.hostName}/admin/restaurants/${restaurantId}/orders/${orderId}`;
  const lineMessage = await createNotifyRestaurantLineMessage(
    messageId,
    restaurantName,
    orderNumber,
    lng
  );
  const mailTitle = await createNotifyRestaurantMailTitle(
    messageId,
    restaurantName,
    orderNumber,
    lng
  );
  const mailMessage = await createNotifyRestaurantMailMessage(
    messageId,
    restaurantName,
    order,
    orderNumber,
    lng,
    url
  );

  // line push.
  const lineUsers = (
    await db.collection(`/restaurants/${restaurantId}/lines`).get()
  ).docs;
  if (lineUsers.length > 0) {
    const results = await notifyRestaurantToLineUser(
      url,
      lineMessage,
      lineUsers
    );
    await db
      .doc(
        `/restaurants/${restaurantId}/log/${datestr}/lineLog/${orderId}-${messageId}`
      )
      .set({
        restaurantId,
        date: datestr,
        orderId,
        messageId,
        results,
        updatedAt: admin.firestore.Timestamp.now()
      });
  }

  if (restaurant.emailNotification) {
    const adminUser =
      process.env.NODE_ENV === "test"
        ? { email: process.env.TESTMAIL }
        : await admin.auth().getUser(restaurant.uid);
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
    updatedAt: admin.firestore.Timestamp.now(),
    url
  });

  // phone notify.
  if (messageId === "msg_order_placed") {
    if (restaurant.phoneCall) {
      await twilio.phoneCall(restaurant);
      await db
        .doc(`/restaurants/${restaurantId}/log/${datestr}/phoneLog/${orderId}`)
        .set({
          restaurantId,
          date: datestr,
          orderId,
          phoneNumber: restaurant.phoneNumber,
          updatedAt: admin.firestore.Timestamp.now()
        });
    }
  }
};

export const notifyNewOrderToRestaurant = async (
  db: FirebaseFirestore.Firestore,
  restaurantId: string,
  order: any,
  restaurantName: string,
  lng: string
) => {
  return notifyRestaurant(
    db,
    "msg_order_placed",
    restaurantId,
    order,
    restaurantName,
    lng
  );
};

export const notifyCanceledOrderToRestaurant = async (
  db: FirebaseFirestore.Firestore,
  restaurantId: string,
  order: any,
  restaurantName: string,
  lng: string
) => {
  return notifyRestaurant(
    db,
    "msg_order_canceled_by_user",
    restaurantId,
    order,
    restaurantName,
    lng
  );
};
