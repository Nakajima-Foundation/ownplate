import { MenuData, MenuItem } from "../../models/menu";

export const menuSnapshot = (liveMenu: MenuData): MenuItem => ({
  price: liveMenu.price,
  itemName: liveMenu.itemName,
  itemPhoto: liveMenu.itemPhoto,
  images: liveMenu.images,
  itemAliasesName: liveMenu.itemAliasesName || "",
  category1: liveMenu.category1 || "",
  category2: liveMenu.category2 || "",
  exceptDay: liveMenu.exceptDay || {},
  exceptHour: liveMenu.exceptHour || {},
  tax: liveMenu.tax || "",
  itemOptionCheckbox: liveMenu.itemOptionCheckbox || [],
});

// 古い注文の写しは itemOptionCheckbox を持たない。値段だけ写しから取ってオプションを生きた
// メニューから取ると、どちらとも違う金額になりうるので、判定は一つにする。
export const hasOrderedMenu = (orderedMenuItem: MenuItem | undefined): orderedMenuItem is MenuItem => orderedMenuItem?.itemOptionCheckbox !== undefined;

export const menuForPricing = (orderedMenuItem: MenuItem | undefined, liveMenu: MenuData): MenuItem => (hasOrderedMenu(orderedMenuItem) ? orderedMenuItem : liveMenu);
