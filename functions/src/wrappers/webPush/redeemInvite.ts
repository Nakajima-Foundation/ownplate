import { getFirestore } from "firebase-admin/firestore";
import { onCall } from "firebase-functions/v2/https";

import { redeemPushInvite } from "../../functions/webPush";
import { enforceAppCheck, requireAppCheck } from "../firebase";

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
    requireAppCheck(context);
    return await redeemPushInvite(db, context.data);
  },
);
