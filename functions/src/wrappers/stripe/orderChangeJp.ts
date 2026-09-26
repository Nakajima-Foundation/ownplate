import { onCall } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";

import { orderChange } from "../../functions/stripe/orderChange";
import { enforceAppCheck, requireAppCheck, secretKeys } from "../firebase";

const db = getFirestore();

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
    return await orderChange(db, context.data, context);
  },
);
