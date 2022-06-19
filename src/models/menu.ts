import { serverTimestamp } from "firebase/firestore";

export interface MenuData {
  itemDescription: string;
  itemName: string;
  itemPhoto: string;
  images: {
    item: {
      resizedImages: {
        [key: string]: string;
      };
    };
  };
  price: number;

  tax: string;

  itemAliasesName: string;
  itemMemo: string;
  itemOptionCheckbox: any[];
  publicFlag: boolean;
  allergens: any;
  category1: string;
  category2: string;

  validatedFlag: boolean;
}

export class Menu {}

// for util function
export const getNewItemData = (
  item: MenuData,
  isJP: boolean,
  validatedFlag: boolean
) => {
  const itemData = {
    itemName: item.itemName,
    itemAliasesName: item.itemAliasesName || "",
    price: isJP ? Math.round(Number(item.price)) : Number(item.price),
    tax: item.tax,
    itemDescription: item.itemDescription,
    itemMemo: item.itemMemo,
    itemPhoto: item.itemPhoto,
    images: {
      item: item.images.item || {},
    },
    itemOptionCheckbox: item.itemOptionCheckbox || [],
    publicFlag: item.publicFlag || false,
    allergens: item.allergens,
    validatedFlag,
    category1: item.category1,
    category2: item.category2,
  };
  return itemData;
};

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
