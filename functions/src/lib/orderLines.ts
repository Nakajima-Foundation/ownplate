import type { DocumentData } from "firebase-admin/firestore";
import type { MenuData, MenuItem } from "../models/menu";
import type { RestaurantInfoData } from "../models/RestaurantInfo";
import type { OptionValue } from "./types/order";
import { selectedOptionNames, selectedOptionsPrice } from "../utils/commonUtils";

export type OrderLines = {
  newOrderData: { [menuId: string]: number[] };
  newItems: { [menuId: string]: MenuItem };
  newPrices: { [menuId: string]: number[] };
  newOptions: { [menuId: string]: string[][] };
  food_sub_total: number;
  alcohol_sub_total: number;
};

// 注文の各行（数量・値段・オプション名）と、食品・お酒の小計を、メニューの値段から組み立て直す。
// 売り切れのメニューの行は落とし、数量 0 の行は積まない。数量が整数でない・負のときは投げる。
// menuObj には、注文にあるメニューがすべて入っていること（呼ぶ側で確かめる）。
export const buildOrderLines = (
  menuObj: Record<string, DocumentData>,
  orderData: { order: { [menuId: string]: number | number[] }; rawOptions?: { [menuId: string]: OptionValue[][] } },
  multiple: number,
): OrderLines => {
  const menuIds = Object.keys(orderData.order);
  const newOrderData: { [menuId: string]: number[] } = {};
  const newItems: { [menuId: string]: MenuItem } = {};
  const newPrices: { [menuId: string]: number[] } = {};
  const newOptions: { [menuId: string]: string[][] } = {};

  let food_sub_total = 0;
  let alcohol_sub_total = 0;

  menuIds.map((menuId) => {
    const menu = menuObj[menuId] as MenuData;

    if (menu.soldOut) {
      return;
    }

    const prices: number[] = [];
    const newOrder: number[] = [];
    const optionNames: string[][] = [];

    const orderItem = orderData.order[menuId];
    const numArray = Array.isArray(orderItem) ? orderItem : [orderItem];
    numArray.map((num, orderKey) => {
      if (!Number.isInteger(num)) {
        throw new Error("invalid number: not integer");
      }
      if (num < 0) {
        throw new Error("invalid number: negative number");
      }
      if (num === 0) {
        return;
      }
      const rawOptions = orderData.rawOptions?.[menuId]?.[orderKey];
      const price = menu.price + (rawOptions ? selectedOptionsPrice(rawOptions, menu.itemOptionCheckbox, multiple) : 0);
      newOrder.push(num);
      prices.push(price * num);
      optionNames.push(rawOptions ? selectedOptionNames(rawOptions, menu.itemOptionCheckbox) : []);
    });
    newPrices[menuId] = prices;
    newOrderData[menuId] = newOrder;
    newOptions[menuId] = optionNames;

    const total = prices.reduce((sum, price) => sum + price, 0);
    if (menu.tax === "alcohol") {
      alcohol_sub_total += total;
    } else {
      food_sub_total += total;
    }
    const menuItem: MenuItem = {
      price: menu.price,
      itemName: menu.itemName,
      itemPhoto: menu.itemPhoto,
      images: menu.images,
      itemAliasesName: menu.itemAliasesName || "",
      category1: menu.category1 || "",
      category2: menu.category2 || "",
      exceptDay: menu.exceptDay || {},
      exceptHour: menu.exceptHour || {},
      tax: menu.tax || "",
    };

    newItems[menuId] = menuItem;
  });
  return {
    newOrderData,
    newItems,
    newPrices,
    newOptions,
    food_sub_total,
    alcohol_sub_total,
  };
};

// 注文の種類（デリバリー・LINE・ランチ／ディナー）が、店の設定で受け付けているものか。受け付けないときは理由を返す。
export const invalidOrderKind = (
  restaurantData: Pick<RestaurantInfoData, "enableDelivery" | "supportLiff" | "enableLunchDinner">,
  orderData: { isDelivery?: boolean; isLiff?: boolean; lunchOrDinner?: string },
): string | undefined => {
  const { isDelivery, isLiff, lunchOrDinner } = orderData;
  if (isDelivery && !restaurantData.enableDelivery) {
    return "Invalid delivery order.";
  }
  if (isLiff && !restaurantData.supportLiff) {
    return "Invalid liff order.";
  }
  if (restaurantData.enableLunchDinner) {
    if (!lunchOrDinner || !["lunch", "dinner"].includes(lunchOrDinner)) {
      return "Invalid lunch dinner order.";
    }
  } else {
    if (lunchOrDinner) {
      return "Invalid lunch dinner order.";
    }
  }
  return undefined;
};
