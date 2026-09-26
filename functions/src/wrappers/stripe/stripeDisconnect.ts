import { onCall } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";

import { disconnect } from "../../functions/stripe/oauth/Disconnect";
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
    return await disconnect(db, context);
  },
);
