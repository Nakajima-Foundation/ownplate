import * as functions from "firebase-functions";
// import * as admin from "firebase-admin";

// import * as Line from "../../functions/line/line";
import { allowInvalidAppCheckToken } from "../firebase";

// const db = admin.firestore();

export default functions
  .runWith({
    maxInstances: 50,
    memory: "1GB" as "1GB",
    allowInvalidAppCheckToken,
  })
  .https.onCall(async (data, context) => {
    if (context.app == undefined) {
      throw new functions.https.HttpsError("failed-precondition", "The function must be called from an App Check verified app.");
    }
    return 
    // return await Line.authenticate(db, data, context);
  });
