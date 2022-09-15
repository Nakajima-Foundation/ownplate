import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

import * as smaregi from "../../functions/smaregi";
import { allowInvalidAppCheckToken } from "../firebase";

const db = admin.firestore();

export default functions
  .region("asia-northeast1")
  .runWith({
    memory: "1GB" as "1GB",
    allowInvalidAppCheckToken,
  })
  .https.onCall(async (data, context) => {
    if (context.app == undefined) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'The function must be called from an App Check verified app.')
    }
    return await smaregi.storeList(db, data, context);
  });
