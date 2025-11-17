import { FieldValue } from "./firebaseUtils";
import { isNull } from "../utils/commonUtils";

export interface MenuImages {
  item?: {
    resizedImages?: {
      [key: string]: string;
    };
    original?: string;
    path?: string;
  };
}

export interface ExceptHour {
  start?: number;
  end?: number;
}
export interface TitleData {
  _dataType: "title";
  id?: string;
  name: string;

  availableLunch: boolean;
  availableDinner: boolean;
}

export interface MenuItem {
  price: number;
  itemName: string;
  itemPhoto: string;
  images: MenuImages;
  itemAliasesName: string;
  category1: string;
  category2: string;
  exceptDay: { [key: string]: boolean };
  exceptHour: ExceptHour;
  tax: string;
}

export interface MenuData extends MenuItem {
  _dataType: "menu";
  id?: string;
  itemDescription: string;

  uid?: string;
  deletedFlag: boolean;

  soldOut: boolean;
  soldOutToday?: string;

  itemMemo: string;
  itemOptionCheckbox: string[];
  publicFlag: boolean;
  allergens: { [key: string]: boolean };

  availableLunch: boolean;
  availableDinner: boolean;

  validatedFlag: boolean;

  createdAt?: FieldValue;
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
): MenuData => {
  const itemData = {
    _dataType: "menu" as const,
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
    deletedFlag: false,
    soldOut: false,
    allergens: item.allergens,
    validatedFlag,
    category1: item.category1,
    category2: item.category2,
    availableLunch: item.availableLunch || false,
    availableDinner: item.availableDinner || false,
    exceptDay: item.exceptDay || {},
    exceptHour: newExceptHour(item.exceptHour || {}),
  };
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
