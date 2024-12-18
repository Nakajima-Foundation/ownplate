import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

import { place } from "../../functions/order/orderPlace";
import { enforceAppCheck, secretKeys } from "../firebase";

const db = admin.firestore();

export default functions
  .region("asia-northeast1")
  .runWith({
    memory: "1GB" as const,
    enforceAppCheck,
    maxInstances: 50,
    secrets: secretKeys,
  })
  .https.onCall(async (data, context) => {
    if (context.app == undefined) {
      throw new functions.https.HttpsError("failed-precondition", "The function must be called from an App Check verified app.");
    }
    return await place(db, data, context);
  });
