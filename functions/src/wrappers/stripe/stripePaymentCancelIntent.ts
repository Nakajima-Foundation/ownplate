import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

import { cancelStripePayment } from "../../functions/stripe/cancelStripePayment";
import { allowInvalidAppCheckToken } from "../firebase";

const db = admin.firestore();

export default functions
  .runWith({
    memory: "1GB" as "1GB",
    maxInstances: 50,
    allowInvalidAppCheckToken,
  })
  .https.onCall(async (data, context) => {
    if (context.app == undefined) {
      throw new functions.https.HttpsError("failed-precondition", "The function must be called from an App Check verified app.");
    }
    return await cancelStripePayment(db, data, context);
  });
