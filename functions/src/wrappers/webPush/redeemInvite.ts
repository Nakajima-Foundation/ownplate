import { getFirestore } from "firebase-admin/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";

import { redeemPushInvite } from "../../functions/webPush";
import { enforceAppCheck } from "../firebase";

const db = getFirestore();

// サインインしていない端末から呼ばれる。資格はトークンを知っていることだけで、
// 書ける先はトークンが指す店舗に限られる。

export default onCall(
  {
    region: "asia-northeast1",
    memory: "1GiB",
    enforceAppCheck,
    maxInstances: 10,
  },
  async (context) => {
    if (context.app == undefined) {
      throw new HttpsError("failed-precondition", "The function must be called from an App Check verified app.");
    }
    return await redeemPushInvite(db, context.data);
  },
);
