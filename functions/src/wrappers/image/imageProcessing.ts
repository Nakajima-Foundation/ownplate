import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

import * as imageFunctions from "../../functions/image/image";

const db = admin.firestore();

export default functions
  .runWith({
    memory: "1GB" as const,
  })
  .storage.object()
  .onFinalize(async (object) => {
    return imageFunctions.imageProcessing(db, object);
  });
