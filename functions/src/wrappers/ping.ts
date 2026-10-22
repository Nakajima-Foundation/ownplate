import { onCall } from "firebase-functions/v2/https";

import { getFirestore } from "firebase-admin/firestore";

import { ping } from "../functions/ping";
import { enforceAppCheck, requireAppCheck } from "./firebase";

const db = getFirestore();

export default onCall(
  {
    region: "asia-northeast1",
    memory: "1GiB",
    enforceAppCheck,
    maxInstances: 100,
  },
  async (context) => {
    requireAppCheck(context);
    return await ping(db, context.data, context);
  },
);
