import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

import * as smaregi from "../../functions/smaregi";

const db = admin.firestore();

export default functions
  .region("asia-northeast1")
  .https.onCall(async (data, context) => {
    return await smaregi.auth(db, data, context);
  });
