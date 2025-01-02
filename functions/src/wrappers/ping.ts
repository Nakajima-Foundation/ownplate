import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

import { ping } from "../functions/ping";
import { enforceAppCheck } from "./firebase";

const db = admin.firestore();

export default functions
  .https.onCall({
    region: "asia-northeast1",
    maxInstances: 100,
    memory: "1GiB" as const,
    enforceAppCheck,
  }, async (request) => {
    if (request.app == undefined) {
      throw new functions.https.HttpsError("failed-precondition", "The function must be called from an App Check verified app.");
    }
    return await ping(db, request.data, request);
  });
