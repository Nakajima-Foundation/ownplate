import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

import * as Account from "../functions/account";
import { allowInvalidAppCheckToken } from "./firebase";

const db = admin.firestore();

export default functions
  .runWith({
    allowInvalidAppCheckToken,
  })
  .https.onCall(async (data, context) => {
    if (context.app == undefined) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'The function must be called from an App Check verified app.')
    }
  return await Account.deleteAccount(db, data, context);
});
