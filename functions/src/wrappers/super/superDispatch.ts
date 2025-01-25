import * as admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";

import { dispatch } from "../../functions/super/super";
import { enforceAppCheck } from "../firebase";

const db = admin.firestore();

export default onCall(
  {
    region: "asia-northeast1",
    memory: "1GiB",
    enforceAppCheck,
    maxInstances: 5,
  },
  async (context) => {
    if (context.app == undefined) {
      throw new HttpsError("failed-precondition", "The function must be called from an App Check verified app.");
    }
    return await dispatch(db, context.data, context);
  });
