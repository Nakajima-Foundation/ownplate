import * as functions from "firebase-functions/v1";
import { HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { stripe_regions } from "../common/constant";
import Stripe from "stripe";
import * as Sentry from "@sentry/node";

import { Context } from "../models/TestType";
import { RestaurantInfoData } from "../models/RestaurantInfo";
import * as admin from "firebase-admin";

const region = "JP"; // config
export const stripeRegion = stripe_regions[region];
const stripe_wh_secret = defineSecret("STRIPE_WH_SECRET");

const stripe_secret = defineSecret("STRIPE_SECRET");

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
export const is_subAccount = (context: functions.https.CallableContext | Context) => {
  return !!context.auth?.token?.parentUid;
};
export const validate_sub_account_request = async (db: admin.firestore.Firestore, uid: string, ownerUid: string, restaurantId: string) => {
  const rList = ((await db.doc(`admins/${ownerUid}/children/${uid}`).get()).data() || {}).restaurantLists || [];
  if (!rList.includes(restaurantId)) {
    throw new functions.https.HttpsError("permission-denied", "The user does not have an authority to perform this operation.");
  }
  return true;
};

export const getStripeWebhookSecretKey = () => {
  const SECRET = stripe_wh_secret.value();
  if (!SECRET) {
    throw new HttpsError("invalid-argument", "The functions requires STRIPE_WH_SECRET.");
  }
  return SECRET;
};

export const get_stripe_v2 = () => {
  const STRIPE_SECRET_KEY = stripe_secret.value();
  if (!STRIPE_SECRET_KEY) {
    throw new HttpsError("invalid-argument", "The functions requires STRIPE_SECRET_KEY.");
  }
  return new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2025-07-30.basil" });
};

export const required_params = (params: Record<string, unknown>) => {
  const errors = Object.keys(params).filter((key) => {
    return params[key] === undefined;
  });
  if (errors.length > 0) {
    throw new functions.https.HttpsError("invalid-argument", "Missing parameters.", { params: errors });
  }
};

export const get_restaurant = async (db: admin.firestore.Firestore, restaurantId: string) => {
  const snapshot = await db.doc(`/restaurants/${restaurantId}`).get();
  const data = snapshot.data() as RestaurantInfoData;
  if (!data) {
    throw new functions.https.HttpsError("invalid-argument", "There is no restaurant with this id.");
  }
  return data;
};

export const get_restaurant_postage = async (db: admin.firestore.Firestore, restaurantId: string) => {
  const snapshot = await db.doc(`/restaurants/${restaurantId}/ec/postage`).get();
  const data = snapshot.data() || {};
  return data;
};

export const get_restaurant_delivery_area = async (db: admin.firestore.Firestore, restaurantId: string) => {
  const snapshot = await db.doc(`/restaurants/${restaurantId}/delivery/area`).get();
  const data = snapshot.data() || {};
  return data;
};

export const get_restaurant_line_config = async (db: admin.firestore.Firestore, restaurantId: string) => {
  const snapshot = await db.doc(`/restaurants/${restaurantId}/private/line`).get();
  const data = snapshot.data() as { client_secret: string; message_token: string };
  if (!data) {
    throw new functions.https.HttpsError("invalid-argument", "There is no restaurant with this id.");
  }
  return data;
};

export const get_restaurant_line_user = async (db: admin.firestore.Firestore, restaurantId: string, uid: string) => {
  const snapshot = await db.doc(`/restaurants/${restaurantId}/lineUsers/${uid}`).get();
  const data = snapshot.data();
  if (!data) {
    return null;
    // throw new functions.https.HttpsError("invalid-argument", "There is no restaurant with this id.");
  }
  return data;
};

export const get_delivery_cost = (orderData: admin.firestore.DocumentData, deliveryData: admin.firestore.DocumentData, total: number) => {
  if (orderData.isDelivery) {
    if (deliveryData.enableDeliveryFree && deliveryData.deliveryFreeThreshold <= total) {
      return 0;
    }
    return Number(deliveryData.deliveryFee || 0);
  }
  return 0;
};

export const log_error = (error: Error) => {
  // console.error((error as any).type);
  console.error(error);
  Sentry.captureException(error);
};

export const process_error = (error: Error) => {
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

const convPrice = (priceStr: string) => {
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

export const getMenuObj = async (refRestaurant: admin.firestore.DocumentReference, menuIds: string[]): Promise<Record<string, admin.firestore.DocumentData>> => {
  const menuObj: Record<string, admin.firestore.DocumentData> = {};
  if (process.env.NODE_ENV !== "test") {
    await Promise.all(
      chunk(menuIds, 10).map(async (menuIdsChunk) => {
        const menusCollections = await refRestaurant.collection("menus").where(admin.firestore.FieldPath.documentId(), "in", menuIdsChunk).get();
        menusCollections.forEach((m: admin.firestore.QueryDocumentSnapshot) => {
          const data = m.data();
          if (data.publicFlag && !data.deletedFlag) {
            menuObj[m.id] = data;
          }
        });
        return;
      }),
    );
    return menuObj;
  } else {
    // for test
    await Promise.all(
      menuIds.map(async (id: string) => {
        const m = await refRestaurant.collection("menus").doc(id).get();
        const data = m.data();
        if (data) {
          menuObj[m.id] = data;
        }
      }),
    );
    return menuObj;
  }
};

export const nameOfOrder = (orderNumber: number) => {
  return "#" + `00${orderNumber}`.slice(-3);
};

export const filterData = <T extends Record<string, unknown>>(data: T): Partial<T> => {
  return Object.keys(data).reduce((tmp: Partial<T>, key) => {
    const value = data[key];
    if (value !== null && value !== undefined) {
      tmp[key as keyof T] = value as T[keyof T];
    }
    return tmp;
  }, {} as Partial<T>);
};

export const isEmpty = (value: unknown): value is null | undefined | "" => {
  return value === null || value === undefined || value === "";
};
