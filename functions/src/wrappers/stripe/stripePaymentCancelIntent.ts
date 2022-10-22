import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

import { cancelStripePayment } from "../../functions/stripe/cancelStripePayment";
import { enforceAppCheck } from "../firebase";

const db = admin.firestore();

export default functions
  .runWith({
    memory: "1GB" as "1GB",
    maxInstances: 50,
    enforceAppCheck,
    secrets: ["MO_AWS_KEY", "MO_AWS_SECRET", "AWS_ID", "AWS_SECRET"],
  })
  .https.onCall(async (data, context) => {
    if (context.app == undefined) {
      throw new functions.https.HttpsError("failed-precondition", "The function must be called from an App Check verified app.");
    }
    return await cancelStripePayment(db, data, context);
  });
