import { onCall } from "firebase-functions/v2/https";

import { enforceAppCheck, requireAppCheck, secretKeys } from "../firebase";

// 注文の編集は画面から外してある。金額の組み直しに穴が残っているので、呼ばれても何もしない。
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
    return { result: false };
  },
);
