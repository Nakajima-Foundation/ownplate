import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import * as utils from "../lib/utils";

// eslint-disable-next-line no-unused-vars
export const getConfig = async (db: admin.firestore.Firestore, data: any, context: functions.https.CallableContext) => {
  return {
    region: utils.getRegion(),
  };
};
