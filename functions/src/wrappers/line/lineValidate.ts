import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import * as Line from "../../functions/line/line";
import { enforceAppCheck, secretKeys } from "../firebase";

const db = admin.firestore();

export default functions
  .region("asia-northeast1")
  .runWith({
    maxInstances: 50,
    memory: "1GB" as const,
    enforceAppCheck,
    secrets: secretKeys,
  })
  .https.onCall(async (data, context) => {
    if (context.app == undefined) {
      throw new functions.https.HttpsError("failed-precondition", "The function must be called from an App Check verified app.");
    }
    return await Line.validate(db, data, context);
  });
