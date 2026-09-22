import type { MenuData } from "../../src/models/menu.ts";

// 型を満たす商品ひとつ分。テストは必要な項目だけ上書きして使う。
const base: MenuData = {
  price: 500,
  itemName: "から揚げ弁当",
  itemAliasesName: "",
  tax: "food",

  itemDescription: "",
  deletedFlag: false,
  soldOut: false,
  itemMemo: "",
  itemOptionCheckbox: [],
  publicFlag: true,
  allergens: {},
  availableLunch: true,
  availableDinner: true,
  validatedFlag: true,
};

export const menuFixture = (overrides: Partial<MenuData> = {}): MenuData => ({
  ...base,
  ...overrides,
});
