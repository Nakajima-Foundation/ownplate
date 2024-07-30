import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

import { update } from "../../functions/order/orderUpdate";
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
    return await update(db, data, context);
  });
