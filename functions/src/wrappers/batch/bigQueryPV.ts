import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

import { bigQueryPV } from "../../functions/batch/bigQueryPV";

const db = admin.firestore();

export default functions
  .region("asia-northeast1")
  .runWith({
    timeoutSeconds: 540,
    maxInstances: 5,
    memory: "1GB" as const,
  })
  .pubsub.schedule("0 5 * * *")
  .timeZone("Asia/Tokyo")
  .onRun(async () => {
    return await bigQueryPV(db);
  });
