import { onCall, HttpsError } from "firebase-functions/v2/https";

import { getFirestore } from "firebase-admin/firestore";

import { ping } from "../functions/ping";
import { enforceAppCheck } from "./firebase";

const db = getFirestore();

export default onCall(
  {
    region: "asia-northeast1",
    memory: "1GiB",
    enforceAppCheck,
    maxInstances: 100,
  },
  async (context) => {
    if (context.app == undefined) {
      throw new HttpsError("failed-precondition", "The function must be called from an App Check verified app.");
    }
    return await ping(db, context.data, context);
  },
);
