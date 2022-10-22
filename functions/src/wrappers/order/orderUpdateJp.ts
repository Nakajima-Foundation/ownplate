import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

import { update } from "../../functions/order/orderUpdate";
import { enforceAppCheck } from "../firebase";

const db = admin.firestore();

export default functions
  .region("asia-northeast1")
  .runWith({
    memory: "1GB" as "1GB",
    enforceAppCheck,
    maxInstances: 50,
    secrets: ["MO_AWS_KEY", "MO_AWS_SECRET", "AWS_ID", "AWS_SECRET", "STRIPE_SECRET"],
  })
  .https.onCall(async (data, context) => {
    if (context.app == undefined) {
      throw new functions.https.HttpsError("failed-precondition", "The function must be called from an App Check verified app.");
    }
    return await update(db, data, context);
  });
