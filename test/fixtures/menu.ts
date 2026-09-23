import type { MenuData, TitleData } from "../../src/models/menu.ts";

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

const titleBase: TitleData = {
  name: "お食事",
  deletedFlag: false,
  availableLunch: true,
  availableDinner: true,
};

export const titleFixture = (
  overrides: Partial<TitleData> = {},
): TitleData => ({
  ...titleBase,
  ...overrides,
});
