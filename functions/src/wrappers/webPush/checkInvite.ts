import { getFirestore } from "firebase-admin/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";

import { checkPushInvite } from "../../functions/webPush";
import { enforceAppCheck } from "../firebase";

const db = getFirestore();

// 登録ページが押す前に呼ぶ。サインインしていない端末から来るので認証は掛けない。
// 状態は変えず、招待の状態だけを返す。

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
    return await checkPushInvite(db, context.data);
  },
);
