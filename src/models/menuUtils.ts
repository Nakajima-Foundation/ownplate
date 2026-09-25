import { serverTimestamp } from "firebase/firestore";
import { type MenuData, type TitleData, getNewItemData } from "./menu";

export const copyMenuData = (
  item: MenuData,
  uid: string | undefined,
): MenuData => {
  const base = getNewItemData(item, item.validatedFlag);
  const data = {
    ...base,
    uid,
    publicFlag: false,
    deletedFlag: false,
    createdAt: serverTimestamp(),
  };
  return data;
};

export const getBlankMenuItem = (uid: string | undefined): MenuData => {
  const itemData = {
    itemName: "",
    itemAliasesName: "",
    price: 0,
    tax: "food",
    itemDescription: "",
    itemMemo: "",
    uid,
    availableLunch: true,
    availableDinner: true,
    deletedFlag: false,
    soldOut: false,
    allergens: {},
    itemOptionCheckbox: [],
    publicFlag: true,
    validatedFlag: false,
    createdAt: serverTimestamp(),
  };
  return itemData;
};
export const getBlankTitleItem = (uid: string | undefined): TitleData => {
  const data = {
    name: "",
    uid,

    availableLunch: true,
    availableDinner: true,

    createdAt: serverTimestamp(),
    deletedFlag: false,
  };
  return data;
};
