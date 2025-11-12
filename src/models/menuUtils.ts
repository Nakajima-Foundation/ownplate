import { serverTimestamp } from "firebase/firestore";
import { type MenuData, getNewItemData } from "./menu";

export const copyMenuData = (item: MenuData, isJP: boolean, uid: string) => {
  const base = getNewItemData(item, isJP, item.validatedFlag);
  const data = Object.assign({}, base, {
    uid,
    publicFlag: false,
    deletedFlag: false,
    createdAt: serverTimestamp(),
  });
  return data;
};

