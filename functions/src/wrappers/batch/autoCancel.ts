import * as functions from "firebase-functions";

import { autoCancel } from "../../functions/batch/autoCancel";
import { secretKeys } from "../firebase";

export default functions
  .region("asia-northeast1")
  .runWith({
    timeoutSeconds: 540,
    maxInstances: 5,
    memory: "1GB" as "1GB",
    secrets: secretKeys,
  })
  .pubsub.schedule("*/5 * * * *")
  .timeZone("Asia/Tokyo")
  .onRun(async () => {
    return await autoCancel();
  });
