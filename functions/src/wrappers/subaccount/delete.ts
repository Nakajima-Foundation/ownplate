import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

import { deleteChild } from "../../functions/subAccount";

const db = admin.firestore();

export default functions.https.onCall(async (data, context) => {
  return await deleteChild(db, data, context);
});
