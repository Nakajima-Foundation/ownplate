import { getFirestore } from "firebase-admin/firestore";
import { onCall } from "firebase-functions/v2/https";

import { dispatch } from "../../functions/super/super";
import { enforceAppCheck, requireAppCheck } from "../firebase";

const db = getFirestore();

export default onCall(
  {
    region: "asia-northeast1",
    memory: "1GiB",
    enforceAppCheck,
    maxInstances: 5,
  },
  async (context) => {
    requireAppCheck(context);
    return await dispatch(db, context.data, context);
  },
);
