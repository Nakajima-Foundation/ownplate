import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

import { place } from "../../functions/order/orderPlace";

const db = admin.firestore();

export default functions
  .region("asia-northeast1")
  .runWith({
    memory: "1GB" as "1GB",
  })
  .https.onCall(async (data, context) => {
    return await place(db, data, context);
  });
