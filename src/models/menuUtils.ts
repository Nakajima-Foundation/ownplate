import { serverTimestamp } from "firebase/firestore";
import { type MenuData, type TitleData, getNewItemData } from "./menu";

export const copyMenuData = (
  item: MenuData,
  isJP: boolean,
  uid: string,
): MenuData => {
  const base = getNewItemData(item, isJP, item.validatedFlag);
  const data = Object.assign({}, base, {
    uid,
    publicFlag: false,
    deletedFlag: false,
    createdAt: serverTimestamp(),
  });
  return data;
};

export const getBlankMenuItem = (uid: string): MenuData => {
  const itemData = {
    _dataType: "menu" as const,
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
export const getBlankTitleItem = (uid: string): TitleData => {
  const data = {
    _dataType: "title" as const,
    name: "",
    uid,
    createdAt: serverTimestamp(),
    deletedFlag: false,
  };
  return data;
};
