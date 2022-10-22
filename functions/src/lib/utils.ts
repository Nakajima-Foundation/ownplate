import * as functions from "firebase-functions";
import { stripe_regions } from "../common/constant";
import Stripe from "stripe";
import * as Sentry from "@sentry/node";

import { Context } from "../models/TestType";
import * as admin from "firebase-admin";

const region = "JP"; // config
export const stripeRegion = stripe_regions[region];

export const timezone = "Asia/Tokyo"; // config

export const validate_auth = (context: functions.https.CallableContext | Context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.");
  }
  return context.auth.uid;
};

export const validate_customer_auth = (context: functions.https.CallableContext | Context) => {
  if (!context.auth || !context.auth.token?.phone_number) {
    throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.");
  }
  return context.auth.uid;
};

export const validate_admin_auth = (context: functions.https.CallableContext | Context) => {
  if (!context.auth || !context.auth?.token?.email) {
    throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.");
  }
  return context.auth.uid;
};

export const validate_owner_admin_auth = (context: functions.https.CallableContext | Context) => {
  if (!context.auth || !context.auth?.token?.email) {
    throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.");
  }
  return context.auth?.token?.parentUid || context.auth.uid;
};
export const validate_parent_admin_auth = (context: functions.https.CallableContext | Context) => {
  if (!context.auth || !context.auth?.token?.email) {
    throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.");
  }
  if (context.auth?.token?.parentUid) {
    throw new functions.https.HttpsError("failed-precondition", "The function must be called parent user.");
  }
  return context.auth.uid;
};
export const is_admin_auth = (context: functions.https.CallableContext | Context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.");
  }
  return !!context.auth?.token?.email;
};

export const getStripeWebhookSecretKey = () => {
  const SECRET = process.env.STRIPE_WH_SECRET;
  if (!SECRET) {
    throw new functions.https.HttpsError("invalid-argument", "The functions requires STRIPE_WH_SECRET.");
  }
  return SECRET;
};

export const get_stripe = () => {
  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET;
  if (!STRIPE_SECRET_KEY) {
    throw new functions.https.HttpsError("invalid-argument", "The functions requires STRIPE_SECRET_KEY.");
  }
  return new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2020-03-02" });
};

export const required_params = (params) => {
  const errors = Object.keys(params).filter((key) => {
    return params[key] === undefined;
  });
  if (errors.length > 0) {
    throw new functions.https.HttpsError("invalid-argument", "Missing parameters.", { params: errors });
  }
};

export const get_restaurant = async (db: admin.firestore.Firestore, restaurantId: String) => {
  const snapshot = await db.doc(`/restaurants/${restaurantId}`).get();
  const data = snapshot.data();
  if (!data) {
    throw new functions.https.HttpsError("invalid-argument", "There is no restaurant with this id.");
  }
  return data;
};

export const get_restaurant_postage = async (db: admin.firestore.Firestore, restaurantId: String) => {
  const snapshot = await db.doc(`/restaurants/${restaurantId}/ec/postage`).get();
  const data = snapshot.data() || {};
  return data;
};

export const get_restaurant_delivery_area = async (db: admin.firestore.Firestore, restaurantId: String) => {
  const snapshot = await db.doc(`/restaurants/${restaurantId}/delivery/area`).get();
  const data = snapshot.data() || {};
  return data;
};

export const get_delivery_cost = (orderData: any, deliveryData: any, total: number) => {
  if (orderData.isDelivery) {
    if (deliveryData.enableDeliveryFree && deliveryData.deliveryFreeThreshold <= total) {
      return 0;
    }
    return Number(deliveryData.deliveryFee || 0);
  }
  return 0;
};

export const process_error = (error: any) => {
  console.error(error);
  Sentry.captureException(error);
  if (error instanceof functions.https.HttpsError) {
    return error;
  }
  // return new functions.https.HttpsError("internal", error.message);
  return new functions.https.HttpsError("internal", "error");
};

// const regex = /\((\+|\-)[0-9\.]+\)/
const regex = /\(((\+|-|＋|ー|−)[0-9.]+)\)/;

const convPrice = (priceStr) => {
  return Number(priceStr.replace(/ー|−/g, "-").replace(/＋/g, "+"));
};

export const optionPrice = (option: string) => {
  const match = option.match(regex);
  if (match) {
    return convPrice(match[1]);
  }
  return 0;
};

const chunk = (arr: string[], chunkSize: number) => {
  const ret: string[][] = [];
  const len = arr.length;
  for (let i = 0; i < len; i += chunkSize) {
    const tmp = arr.slice(i, i + chunkSize);
    ret.push(tmp);
  }
  return ret;
};

export const getMenuObj = async (refRestaurant, menuIds) => {
  const menuObj = {};
  if (process.env.NODE_ENV !== "test") {
    await Promise.all(
      chunk(menuIds, 10).map(async (menuIdsChunk) => {
        const menusCollections = await refRestaurant.collection("menus").where(admin.firestore.FieldPath.documentId(), "in", menuIdsChunk).get();
        menusCollections.forEach((m) => {
          menuObj[m.id] = m.data();
        });
        return;
      })
    );
    return menuObj;
  } else {
    // for test
    await Promise.all(
      menuIds.map(async (id) => {
        const m = await refRestaurant.collection("menus").doc(id).get();
        menuObj[m.id] = m.data();
      })
    );
    return menuObj;
  }
};

export const nameOfOrder = (orderNumber: number) => {
  return "#" + `00${orderNumber}`.slice(-3);
};

export const filterData = (data: { [key: string]: any }) => {
  return Object.keys(data).reduce((tmp: { [key: string]: any }, key) => {
    if (data[key] !== null && data[key] !== undefined) {
      tmp[key] = data[key];
    }
    return tmp;
  }, {});
};

export const isEmpty = (value: any) => {
  return value === null || value === undefined || value === "";
};
