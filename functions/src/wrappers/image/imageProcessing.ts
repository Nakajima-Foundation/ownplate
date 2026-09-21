import { onObjectFinalized } from "firebase-functions/v2/storage";
import { getFirestore } from "firebase-admin/firestore";

import * as imageFunctions from "../../functions/image/image";
import { bucketRegion } from "../../common/project";
const db = getFirestore();

export default onObjectFinalized(
  {
    region: bucketRegion,
    memory: "1GiB",
  },
  async (event) => {
    console.log("RUN");
    return imageFunctions.imageProcessing(db, event.data);
  },
);
