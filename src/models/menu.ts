import { FieldValue } from "./firebaseUtils";
import { isNull } from "../utils/commonUtils";

export interface MenuImages {
  item?: {
    resizedImages: {
      [key: string]: string;
    };
    original: string;
    path?: string;
  };
}

export interface ExceptHour {
  start?: number;
  end?: number;
}
export interface TitleData {
  _dataType: "title";
  id: string;
  name: string;

  availableLunch: boolean;
  availableDinner: boolean;
}

export interface MenuData {
  _dataType: "menu";
  id: string;
  itemDescription: string;
  itemName: string;
  itemPhoto: string;
  images: MenuImages;
  price: number;

  tax: string;

  uid: string;
  deletedFlag: boolean;

  soldOut: boolean;
  soldOutToday?: string;

  itemAliasesName: string;
  itemMemo: string;
  itemOptionCheckbox: string[];
  publicFlag: boolean;
  allergens: { [key: string]: boolean };
  category1: string;
  category2: string;

  availableLunch: boolean;
  availableDinner: boolean;

  exceptDay: { [key: string]: boolean };
  exceptHour: ExceptHour;
  validatedFlag: boolean;

  createdAt: FieldValue;
}

// for util function

const newExceptHour = (exceptHour: ExceptHour) => {
  const { start, end } = exceptHour;
  if (isNull(start) || isNull(end)) {
    return {};
  }
  if ((start || 0) > (end || 0)) {
    return {
      start: end,
      end: start,
    };
  }
  return {
    start,
    end,
  };
};
export const getNewItemData = (
  item: MenuData,
  isJP: boolean,
  validatedFlag: boolean,
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
      item: item?.images?.item || {},
    },
    itemOptionCheckbox: item.itemOptionCheckbox || [],
    publicFlag: validatedFlag ? item.publicFlag || false : false,
    allergens: item.allergens,
    validatedFlag,
    category1: item.category1,
    category2: item.category2,
    availableLunch: item.availableLunch || false,
    availableDinner: item.availableDinner || false,
    exceptDay: item.exceptDay || {},
    exceptHour: newExceptHour(item.exceptHour || {}),
  } as MenuData;
  return itemData;
};

export const isAvailableLunchOrDinner = (item: MenuData | TitleData) => {
  const { availableLunch, availableDinner } = item;
  if (!availableLunch && !availableDinner) {
    return { availableLunch: true, availableDinner: true };
  }
  return { availableLunch, availableDinner };
};
export const onlyLunchOrDinner = (item: MenuData) => {
  const { availableLunch, availableDinner } = isAvailableLunchOrDinner(item);
  return {
    onlyLunch: availableLunch && !availableDinner,
    onlyDinner: !availableLunch && availableDinner,
  };
};
