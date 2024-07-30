import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

import * as StripeReceipt from "../../functions/stripe/receipt";
import { enforceAppCheck, secretKeys } from "../firebase";

const db = admin.firestore();

export default functions
  .runWith({
    memory: "1GB" as const,
    maxInstances: 10,
    enforceAppCheck,
    secrets: secretKeys,
  })
  .https.onCall(async (data, context) => {
    if (context.app == undefined) {
      throw new functions.https.HttpsError("failed-precondition", "The function must be called from an App Check verified app.");
    }
    return await StripeReceipt.receipt(db, data, context);
  });
