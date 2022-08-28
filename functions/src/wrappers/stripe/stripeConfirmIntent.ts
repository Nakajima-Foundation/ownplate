import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

import { confirm } from "../../stripe/confirmIntent";

const db = admin.firestore();

export default functions
  .runWith({
    memory: "1GB" as "1GB",
  })
  .https.onCall(async (data, context) => {
    return await confirm(db, data, context);
  });
