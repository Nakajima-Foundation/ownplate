import { getFirestore } from "firebase-admin/firestore";
import { onCall } from "firebase-functions/v2/https";

import { sendTestWebPush } from "../../functions/webPush";
import { enforceAppCheck, requireAppCheck } from "../firebase";

const db = getFirestore();

export default onCall(
  {
    region: "asia-northeast1",
    memory: "1GiB",
    enforceAppCheck,
    maxInstances: 10,
  },
  async (context) => {
    requireAppCheck(context);
    return await sendTestWebPush(db, context.data, context);
  },
);
