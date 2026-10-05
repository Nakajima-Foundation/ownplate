import { getAuth } from "firebase-admin/auth";
import {
  DocumentData,
  DocumentSnapshot,
  FieldValue,
  Firestore,
} from "firebase-admin/firestore";
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
import { runIsolated } from "./notify/isolate";
import {
  SHOP_MESSAGE_COLLECTION,
  shopMessageId,
  shopMessageRecord,
} from "./notify/shopMessageFormat";
import * as twilio from "./notify/twilio";
import * as ses from "./notify/ses";
import { isWebPushConfigured, sendWebPush } from "./notify/webpush";
import { createOrderPushData } from "./notify/webpushFormat";

const LINE_MESSAGE_TOKEN = defineSecret("LINE_MESSAGE_TOKEN");

// for customer
// 投げうる本体。呼ぶのは下の sendMessageToCustomer だけ。
const sendMessageToCustomerMayThrow = async (
  db: Firestore,
  msgKey: string,
  hasLine: boolean,
  restaurantName: string,
  orderData: DocumentData,
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
    const lineUser = await utils.get_restaurant_line_user(
      db,
      restaurantId,
      orderData.uid,
    );

    const uidLine = lineUser?.profile?.userId;
    const token = config?.message_token;
    if (uidLine && token) {
      await sendMessageDirect(uidLine, getMessage(url), token);
      return;
    }
  }

  // for JP
  const { lineId, liffIndexId, liffId } = await getLineId(db, orderData.uid);

  if (lineId) {
    if (liffIndexId) {
      // liff
      const { token } = await getLiffPrivateConfig(db, liffIndexId);
      if (token) {
        const liffUrl = `https://liff.line.me/${liffId}/r/${restaurantId}/order/${orderId}`;
        await sendMessageDirect(lineId, getMessage(liffUrl), token);
      }
    } else {
      await sendMessageDirect(
        lineId,
        getMessage(url),
        LINE_MESSAGE_TOKEN.value(),
      );
    }
  }
  // force SMS ( for cancel and change order)
  if (forceSMS && orderData.phoneNumber) {
    await sms.pushSMS("omochikaeri", getMessage(url), orderData.phoneNumber);
  }
};

// for restaurant
const createNotifyRestaurantSubject = async (
  messageId: string,
  orderNumber: number,
  lng: string,
) => {
  const t = await i18next.init({
    lng: lng || stripe_regions_jp.langs[0],
    resources,
  });
  const orderName = utils.nameOfOrder(orderNumber);
  return `${t(messageId)} ${orderName}`;
};

// 呼ばれるのは注文の確定や capture が済んだあと。投げると、処理は通っているのに
// 客には失敗が返る。だから投げない。失敗は console に残す。
export const sendMessageToCustomer = async (
  db: Firestore,
  msgKey: string,
  hasLine: boolean,
  restaurantName: string,
  orderData: DocumentData,
  restaurantId: string,
  orderId: string,
  params: Record<string, string | number> = {},
  forceSMS: boolean = false,
) =>
  neverFailTheCaller("sendMessageToCustomer", () =>
    sendMessageToCustomerMayThrow(
      db,
      msgKey,
      hasLine,
      restaurantName,
      orderData,
      restaurantId,
      orderId,
      params,
      forceSMS,
    ),
  );

export const createNotifyRestaurantMailMessage = async (
  messageId: string,
  restaurantName: string,
  order: DocumentData,
  orderNumber: number,
  _lng: string,
  url: string,
) => {
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
            if (
              order.options &&
              order.options[menuId] &&
              order.options[menuId][key]
            ) {
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
  orderId: string;
  messageId: string;
  restaurantName: string;
  subject: string;
  datestr: string;
};

const sendRestaurantWebPush = async (db: Firestore, params: WebPushParams) => {
  const { restaurantId, orderId, messageId, restaurantName, subject, datestr } =
    params;
  const payload = createOrderPushData(
    subject,
    restaurantName,
    restaurantId,
    orderId,
  );
  const result = await sendWebPush(db, restaurantId, payload);
  if (result.targets === 0) {
    return;
  }
  await db
    .doc(
      `/restaurants/${restaurantId}/log/${datestr}/webPushLog/${orderId}-${messageId}`,
    )
    .set({
      restaurantId,
      date: datestr,
      orderId,
      messageId,
      sent: result.sent,
      failed: result.failed,
      // 失敗したときの FCM のコード。これが無いと「届いていない」以上の切り分けができない。
      codes: result.codes,
      targets: result.targets,
      updatedAt:
        process.env.NODE_ENV !== "test"
          ? FieldValue.serverTimestamp()
          : Date.now(),
    });
};

// 失敗が他の経路を巻き込まないのは runIsolated 側の仕事。ここでは握らない。
const notifyRestaurantByWebPush = async (
  db: Firestore,
  params: WebPushParams,
) => {
  if (!isWebPushConfigured()) {
    return;
  }
  await sendRestaurantWebPush(db, params);
};

const notifyRestaurantToLineUser = async (
  url: string,
  message: string,
  lineUsers: DocumentSnapshot[],
) => {
  const results = await Promise.all(
    lineUsers.map(async (doc) => {
      const lineUser = doc.data();
      if (lineUser && lineUser.notify) {
        await sendMessageDirect(
          doc.id,
          `${message} ${url}?openExternalBrowser=1`,
          LINE_MESSAGE_TOKEN.value(),
        );
      }
      return lineUser;
    }),
  );
  return results;
};

// LINE の talk の代わりになる、店舗向けの timeline。**配信とは独立に書く** —
// 端末を登録していない店でも、通知が1つも届かなくても、何を伝えたかは残す。
const recordShopMessage = async (
  db: Firestore,
  p: {
    restaurantId: string;
    orderId: string;
    messageId: string;
    orderNumber: number;
    text: string;
  },
) => {
  await db
    .doc(
      `/restaurants/${p.restaurantId}/${SHOP_MESSAGE_COLLECTION}/${shopMessageId(p.orderId, p.messageId)}`,
    )
    .set({
      ...shopMessageRecord(p),
      createdAt:
        process.env.NODE_ENV !== "test"
          ? FieldValue.serverTimestamp()
          : Date.now(),
    });
};

const notifyLineUsers = async (
  db: Firestore,
  p: {
    restaurantId: string;
    datestr: string;
    orderId: string;
    messageId: string;
    url: string;
    message: string;
  },
) => {
  const lineUsers = (
    await db.collection(`/restaurants/${p.restaurantId}/lines`).get()
  ).docs;
  if (lineUsers.length === 0) {
    return;
  }
  const results = await notifyRestaurantToLineUser(p.url, p.message, lineUsers);
  await db
    .doc(
      `/restaurants/${p.restaurantId}/log/${p.datestr}/lineLog/${p.orderId}-${p.messageId}`,
    )
    .set({
      restaurantId: p.restaurantId,
      date: p.datestr,
      orderId: p.orderId,
      messageId: p.messageId,
      results,
      updatedAt:
        process.env.NODE_ENV !== "test"
          ? FieldValue.serverTimestamp()
          : Date.now(),
    });
};

// 本文の組み立てもこの中。外に出すと、描画が落ちただけで他の4経路まで止まる。
const notifyByMail = async (
  restaurant: RestaurantInfoData,
  subject: string,
  body: () => Promise<string>,
) => {
  if (!restaurant.emailNotification) {
    return;
  }
  const adminUser =
    process.env.NODE_ENV === "test"
      ? { email: process.env.TESTMAIL }
      : await getAuth().getUser(restaurant.uid);
  if (adminUser.email) {
    await ses.sendMail(adminUser.email, subject, await body());
  }
};

// 開いている管理画面が見ている1つの文書。履歴は残らず、常に最新で上書きされる。
const notifyOpenAdminScreen = async (
  db: Firestore,
  p: { uid: string; restaurantId: string; message: string; url: string },
) => {
  await db.doc(`/admins/${p.uid}/private/notification`).set({
    lineMessage: p.message,
    sound: true,
    path: `/admin/restaurants/${p.restaurantId}`,
    updatedAt:
      process.env.NODE_ENV !== "test"
        ? FieldValue.serverTimestamp()
        : Date.now(),
    url: p.url,
  });
};

const notifyByPhone = async (
  db: Firestore,
  restaurant: RestaurantInfoData,
  p: {
    restaurantId: string;
    datestr: string;
    orderId: string;
    messageId: string;
  },
) => {
  if (p.messageId !== "msg_order_placed" || !restaurant.phoneCall) {
    return;
  }
  await twilio.phoneCall(restaurant);
  await db
    .doc(
      `/restaurants/${p.restaurantId}/log/${p.datestr}/phoneLog/${p.orderId}`,
    )
    .set({
      restaurantId: p.restaurantId,
      date: p.datestr,
      orderId: p.orderId,
      phoneNumber: restaurant.phoneNumber,
      updatedAt:
        process.env.NODE_ENV !== "test"
          ? FieldValue.serverTimestamp()
          : Date.now(),
    });
};

// 経路は互いから切り離す。ここを呼ぶのは注文の確定や capture が済んだあとなので、
// 1つ落ちただけで残りを止めると、店にはどの経路でも届かなくなる。
export const notifyRestaurant = async (
  db: Firestore,
  messageId: string,
  restaurantId: string,
  order: DocumentData,
  restaurantName: string,
) => {
  const lng = stripe_regions_jp.langs[0];
  const datestr = moment().format("YYYY-MM-DD");
  const restaurant = (
    await db.doc(`/restaurants/${restaurantId}`).get()
  ).data() as RestaurantInfoData;
  if (!restaurant) {
    // paranoia
    return { done: [], failed: [] };
  }
  const orderId = order.id;
  const url = `https://${ownPlateConfig.hostName}/admin/restaurants/${restaurantId}/orders/${orderId}`;
  const subject = await createNotifyRestaurantSubject(
    messageId,
    order.number,
    lng,
  );
  const message = `${subject} ${restaurantName}`;
  const mailMessage = () =>
    createNotifyRestaurantMailMessage(
      messageId,
      restaurantName,
      order,
      order.number,
      lng,
      url,
    );
  const where = { restaurantId, datestr, orderId, messageId };

  return runIsolated(
    [
      {
        name: "timeline",
        run: () =>
          recordShopMessage(db, {
            restaurantId,
            orderId,
            messageId,
            orderNumber: order.number,
            text: message,
          }),
      },
      {
        name: "line",
        run: () => notifyLineUsers(db, { ...where, url, message }),
      },
      {
        name: "mail",
        run: () => notifyByMail(restaurant, message, mailMessage),
      },
      {
        name: "adminScreen",
        run: () =>
          notifyOpenAdminScreen(db, {
            uid: restaurant.uid,
            restaurantId,
            message,
            url,
          }),
      },
      {
        name: "webPush",
        run: () =>
          notifyRestaurantByWebPush(db, { ...where, restaurantName, subject }),
      },
      { name: "phone", run: () => notifyByPhone(db, restaurant, where) },
    ],
    (name, error) => {
      console.error("notifyRestaurant: a delivery path failed", {
        name,
        restaurantId,
        orderId,
        messageId,
        error,
      });
    },
  );
};

// 呼ばれるのは注文の確定や capture が済んだあと。ここで投げると、処理は通っている
// のに呼び手にはエラーが返り、客には失敗に見えて二重注文になる。だから投げない。
const neverFailTheCaller = (what: string, run: () => Promise<unknown>) =>
  runIsolated(
    [{ name: what, run: async () => void (await run()) }],
    (name, error) => {
      console.error("notify: the whole path failed", { name, error });
    },
  );

export const notifyNewOrderToRestaurant = async (
  db: Firestore,
  restaurantId: string,
  order: DocumentData,
  restaurantName: string,
) => {
  return neverFailTheCaller("notifyNewOrderToRestaurant", () =>
    notifyRestaurant(
      db,
      "msg_order_placed",
      restaurantId,
      order,
      restaurantName,
    ),
  );
};

export const notifyCanceledOrderToRestaurant = async (
  db: Firestore,
  restaurantId: string,
  order: DocumentData,
  restaurantName: string,
) => {
  return neverFailTheCaller("notifyCanceledOrderToRestaurant", () =>
    notifyRestaurant(
      db,
      "msg_order_canceled_by_user",
      restaurantId,
      order,
      restaurantName,
    ),
  );
};
