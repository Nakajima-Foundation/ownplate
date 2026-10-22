import { onCall } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";

import { cancel } from "../../functions/stripe/cancelIntent";
import { enforceAppCheck, requireAppCheck, secretKeys } from "../firebase";

const db = getFirestore();

export default onCall(
  {
    region: "asia-northeast1",
    memory: "1GiB",
    enforceAppCheck,
    maxInstances: 5,
    secrets: secretKeys,
  },
  async (context) => {
    requireAppCheck(context);
    return await cancel(db, context.data, context);
  },
);
