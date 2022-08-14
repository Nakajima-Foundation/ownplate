import { serverTimestamp } from "firebase/firestore";
import { isNull } from "../utils/utils";

export interface MenuImages {
  item: {
    resizedImages: {
      [key: string]: string;
    };
  };
}

export interface ExceptHour {
  start?: number;
  end?: number;
}

export interface MenuData {
  itemDescription: string;
  itemName: string;
  itemPhoto: string;
  images: MenuImages;
  price: number;

  tax: string;

  itemAliasesName: string;
  itemMemo: string;
  itemOptionCheckbox: any[];
  publicFlag: boolean;
  allergens: any;
  category1: string;
  category2: string;
  exceptDay: {[key: string]: boolean};
  exceptHour: ExceptHour,
  validatedFlag: boolean;
}

export class Menu {}

// for util function

const newExceptHour = (exceptHour: ExceptHour) => {
  const { start, end } = exceptHour;
  if (isNull(start) || isNull(end)) {
    return {}
  }
  if ((start || 0) > (end || 0)) {
    return {
      start: end,
      end: start,
    }
  }
  return {
    start,
    end,
  }
};
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
    publicFlag: validatedFlag ? item.publicFlag || false : false,
    allergens: item.allergens,
    validatedFlag,
    category1: item.category1,
    category2: item.category2,
    exceptDay: item.exceptDay || {},
    exceptHour: newExceptHour(item.exceptHour),
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
