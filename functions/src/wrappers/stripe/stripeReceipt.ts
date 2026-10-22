import { onCall } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";

import { receipt } from "../../functions/stripe/receipt";
import { enforceAppCheck, requireAppCheck, secretKeys } from "../firebase";

const db = getFirestore();

export default onCall(
  {
    region: "asia-northeast1",
    memory: "1GiB",
    enforceAppCheck,
    maxInstances: 10,
    secrets: secretKeys,
  },
  async (context) => {
    requireAppCheck(context);
    return await receipt(db, context.data, context);
  },
);
