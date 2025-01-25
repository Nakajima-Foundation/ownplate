import * as functions from "firebase-functions/v1";
import * as utils from "../../lib/utils";
import * as admin from "firebase-admin";

import moment from "moment-timezone";

import { Context } from "../../models/TestType";
import { superTwilioCallData } from "../../lib/types";

import * as twilio from "../twilio";

export const superTwilioCall = async (db: admin.firestore.Firestore, data: superTwilioCallData, context: functions.https.CallableContext | Context) => {
  if (!context.auth?.token?.admin) {
    throw new functions.https.HttpsError("permission-denied", "You do not have permission to confirm this request.");
  }
  const { restaurantId } = data;
  utils.required_params({ restaurantId });

  const restaurantData = await utils.get_restaurant(db, restaurantId);
  if (restaurantData) {
    const datestr = moment().format("YYYY-MM-DD");
    await twilio.phoneCall(restaurantData);
    await db.collection(`/restaurants/${restaurantId}/log/${datestr}/phoneLog`).add({
      restaurantId,
      date: datestr,
      phoneNumber: restaurantData.phoneNumber,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
  return {};
};
