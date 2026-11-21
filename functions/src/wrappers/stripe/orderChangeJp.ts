import { HttpsError, onCall } from "firebase-functions/v2/https";

import { enforceAppCheck, requireAppCheck, secretKeys } from "../firebase";

// 注文の編集は画面から外してある。金額の組み直しに穴が残っているので、呼ばれても何もせず断る。
export default onCall(
  {
    region: "asia-northeast1",
    memory: "1GiB",
    enforceAppCheck,
    maxInstances: 50,
    secrets: secretKeys,
  },
  async (context) => {
    requireAppCheck(context);
    throw new HttpsError("failed-precondition", "Order change is closed.");
  },
);
