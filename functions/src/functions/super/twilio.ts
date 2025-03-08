import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import * as utils from "../../lib/utils";
import * as admin from "firebase-admin";

import moment from "moment-timezone";

import { superTwilioCallData } from "../../lib/types";

import { phoneCall } from "../notify/twilio";

export const superTwilioCall = async (db: admin.firestore.Firestore, data: superTwilioCallData, context: CallableRequest) => {
  if (!context.auth?.token?.admin) {
    throw new HttpsError("permission-denied", "You do not have permission to confirm this request.");
  }
  const { restaurantId } = data;
  utils.required_params({ restaurantId });

  const restaurantData = await utils.get_restaurant(db, restaurantId);
  if (restaurantData) {
    const datestr = moment().format("YYYY-MM-DD");
    await phoneCall(restaurantData);
    await db.collection(`/restaurants/${restaurantId}/log/${datestr}/phoneLog`).add({
      restaurantId,
      date: datestr,
      phoneNumber: restaurantData.phoneNumber,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
  return {};
};
