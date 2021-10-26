import * as functions from "firebase-functions";
import * as utils from "../lib/utils";
import * as admin from "firebase-admin";

import moment from "moment-timezone";

import { Context } from "../models/TestType";

import * as twilio from "./twilio";

export const dispatch = async (db: admin.firestore.Firestore, data: any, context: functions.https.CallableContext) => {
  if (!context.auth?.token?.admin) {
    throw new functions.https.HttpsError("permission-denied", "You do not have permission to confirm this request.");
  }
  const uidSuper = utils.validate_auth(context);
  const { cmd, uid, key, value } = data;
  utils.validate_params({ cmd, uid });

  let result: object = { result: false, message: "not processed" };
  try {
    switch (cmd) {
      case "getCustomeClaims":
        result = await getCustomClaims(db, uid);
        break;
      case "setCustomClaim": {
        const userRecord = await admin.auth().getUser(uid);
        if (key === "operator" && userRecord.email) {
          result = await setCustomClaim(db, uid, key, value);
          await db.collection(`admins/${uidSuper}/adminlogs`).add({
            uid,
            uidSuper,
            cmd,
            key,
            value,
            email: userRecord.email,
            success: true,
            createdAt: admin.firestore.Timestamp.now(),
          });
        } else {
          await db.collection(`admins/${uidSuper}/adminlogs`).add({
            uid,
            uidSuper,
            cmd,
            key,
            value,
            success: false,
            error: "invalid_parameters",
            createdAt: admin.firestore.Timestamp.now(),
          });
        }
        break;
      }
      default:
        await db.collection(`admins/${uidSuper}/adminlogs`).add({
          uid,
          uidSuper,
          cmd,
          key,
          value,
          success: false,
          error: "invalid_cmd",
          createdAt: admin.firestore.Timestamp.now(),
        });
        throw new functions.https.HttpsError("invalid-argument", "Invalid command.");
    }

    return result;
  } catch (error) {
    throw utils.process_error(error);
  }
};

const getCustomClaims = async (db: admin.firestore.Firestore, uid: string) => {
  const userRecord = await admin.auth().getUser(uid);
  const customClaims = userRecord.customClaims || {};
  return { result: customClaims };
};

const setCustomClaim = async (db: admin.firestore.Firestore, uid: string, key: string, value: boolean) => {
  const obj = { [key]: value };
  await admin.auth().setCustomUserClaims(uid, obj);
  await db.doc(`admins/${uid}`).update(obj); // duplicated data in DB
  return await getCustomClaims(db, uid);
};


export const superTwilioCall = async (db: any, data: any, context: functions.https.CallableContext | Context) => {
  if (!context.auth?.token?.admin) {
    throw new functions.https.HttpsError("permission-denied", "You do not have permission to confirm this request.");
  }
  const { restaurantId } = data;
  utils.validate_params({ restaurantId });

  const restaurantData = await utils.get_restaurant(db, restaurantId);
  if (restaurantData) {
    const datestr = moment().format("YYYY-MM-DD");
    await twilio.phoneCall(restaurantData);
    await db.collection(`/restaurants/${restaurantId}/log/${datestr}/phoneLog`).add({
      restaurantId,
      date: datestr,
      phoneNumber: restaurantData.phoneNumber,
      updatedAt: admin.firestore.Timestamp.now(),
    });
  }
  return {};
}
