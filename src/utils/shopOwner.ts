import { doc, getDoc } from "firebase/firestore";

import { db } from "@/lib/firebase/firebase9";
import { ShopOwnerData } from "@/models/ShopOwner";

// utils.ts から分けてある。あちらは firebase9 を読み込んだ時点で initializeApp と
// initializeAppCheck を走らせるので、Firebase を必要としない関数まで初期化を引いていた。
export const getShopOwner = async (
  uid: string | undefined,
): Promise<ShopOwnerData> => {
  const defaultData = { hidePrivacy: false };
  // 呼ぶのは管理者判定を通った画面だけだが、uid は署名の確認が済むまで無い。
  // 無いまま /admins/undefined を読んでも同じ既定値になるので、読まずに返す。
  if (uid === undefined) {
    return defaultData;
  }
  const admin = (await getDoc(doc(db, `/admins/${uid}`))).data();
  if (admin) {
    return admin as ShopOwnerData;
  }
  return defaultData;
};
