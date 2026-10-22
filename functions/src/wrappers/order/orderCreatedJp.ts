import { onCall } from "firebase-functions/v2/https";

import { getFirestore } from "firebase-admin/firestore";

import { orderCreated } from "../../functions/order/orderCreated";
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
    await orderCreated(db, context.data, context);
  },
);
