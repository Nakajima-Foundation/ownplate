import { describe, it } from "node:test";
import assert from "node:assert";
import type { MenuData, TitleData } from "../../src/models/menu";
import {
  isAvailableLunchOrDinner,
  onlyLunchOrDinner,
} from "../../src/models/menu";

// このファイルは tsx を通さないと読めない。src/models/menu.ts が拡張子なしで
// ./firebaseUtils を import していて、素の node --test はそれを解決できないため。
// 拡張子を足す手は使えない（`functions/` 配下が tsc で JavaScript に変換するので TS5097 で落ちる）。

const menuItem = (
  availableLunch: boolean,
  availableDinner: boolean,
): MenuData => ({
  price: 1000,
  itemName: "唐揚げ",
  itemAliasesName: "",
  tax: "food",
  itemDescription: "",
  itemMemo: "",
  itemOptionCheckbox: [],
  publicFlag: true,
  deletedFlag: false,
  soldOut: false,
  validatedFlag: true,
  allergens: {},
  availableLunch,
  availableDinner,
});

const titleItem = (
  availableLunch: boolean,
  availableDinner: boolean,
): TitleData => ({
  name: "お食事",
  deletedFlag: false,
  availableLunch,
  availableDinner,
});

// 店舗が昼も夜も指定しなかった商品は「いつでも出す」。どちらも false のまま素直に読むと、
// 指定していないだけの商品が昼にも夜にも出なくなる。
describe("isAvailableLunchOrDinner", () => {
  it("reads an item with neither set as available at both times", () => {
    assert.deepStrictEqual(isAvailableLunchOrDinner(menuItem(false, false)), {
      availableLunch: true,
      availableDinner: true,
    });
  });

  it("leaves an item alone once either time is set", () => {
    assert.deepStrictEqual(isAvailableLunchOrDinner(menuItem(true, false)), {
      availableLunch: true,
      availableDinner: false,
    });
    assert.deepStrictEqual(isAvailableLunchOrDinner(menuItem(false, true)), {
      availableLunch: false,
      availableDinner: true,
    });
    assert.deepStrictEqual(isAvailableLunchOrDinner(menuItem(true, true)), {
      availableLunch: true,
      availableDinner: true,
    });
  });

  it("applies the same rule to a heading", () => {
    assert.deepStrictEqual(isAvailableLunchOrDinner(titleItem(false, false)), {
      availableLunch: true,
      availableDinner: true,
    });
    assert.deepStrictEqual(isAvailableLunchOrDinner(titleItem(false, true)), {
      availableLunch: false,
      availableDinner: true,
    });
  });
});

// 画面は「昼だけ」「夜だけ」の札を出すのにこれを使う。両方可の商品に札が出てはいけない。
describe("onlyLunchOrDinner", () => {
  it("marks an item that is served at one time only", () => {
    assert.deepStrictEqual(onlyLunchOrDinner(menuItem(true, false)), {
      onlyLunch: true,
      onlyDinner: false,
    });
    assert.deepStrictEqual(onlyLunchOrDinner(menuItem(false, true)), {
      onlyLunch: false,
      onlyDinner: true,
    });
  });

  it("marks nothing when the item is served at both times", () => {
    assert.deepStrictEqual(onlyLunchOrDinner(menuItem(true, true)), {
      onlyLunch: false,
      onlyDinner: false,
    });
  });

  // 未指定は両方可になるので、札は出ない。ここが逆になると、何も設定していない商品が
  // 「昼だけ」と表示される。
  it("marks nothing for an item with neither time set", () => {
    assert.deepStrictEqual(onlyLunchOrDinner(menuItem(false, false)), {
      onlyLunch: false,
      onlyDinner: false,
    });
  });
});
