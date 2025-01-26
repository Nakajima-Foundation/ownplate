import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

import { orderPay } from "../../functions/stripe/orderPay";
import { enforceAppCheck, secretKeys } from "../firebase";

const db = admin.firestore();

export default functions
  .region("asia-northeast1")
  .runWith({
    memory: "1GB" as const,
    maxInstances: 50,
    enforceAppCheck,
    secrets: secretKeys,
  })
  .https.onCall(async (data, context) => {
    if (context.app == undefined) {
      throw new functions.https.HttpsError("failed-precondition", "The function must be called from an App Check verified app.");
    }
    return await orderPay(db, data, context as any);
  });
