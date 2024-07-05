import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

import { deleteChild } from "../../functions/subAccount";
import { enforceAppCheck } from "../firebase";

const db = admin.firestore();

export default functions
  .region("asia-northeast1")
  .runWith({
    maxInstances: 10,
    memory: "1GB" as const,
    enforceAppCheck,
  })
  .https.onCall(async (data, context) => {
    if (context.app == undefined) {
      throw new functions.https.HttpsError("failed-precondition", "The function must be called from an App Check verified app.");
    }
    return await deleteChild(db, data, context);
  });
