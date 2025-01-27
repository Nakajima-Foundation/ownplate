import { onObjectFinalized } from "firebase-functions/v2/storage";
import * as admin from "firebase-admin";

import * as imageFunctions from "../../functions/image/image";

const db = admin.firestore();

export default onObjectFinalized(
  {
    memory: "1GiB",
  },
  async (event) => {
    console.log("RUN");
    return imageFunctions.imageProcessing(db, event.data);
  }
);
