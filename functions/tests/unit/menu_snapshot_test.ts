import { describe, it } from "node:test";
import assert from "node:assert";

import { hasOrderedMenu, menuForPricing, menuSnapshot } from "../../src/functions/order/menuSnapshot";
import { MenuData, MenuItem } from "../../src/models/menu";

const liveMenu = (values: Partial<MenuData>): MenuData =>
  ({
    price: 1000,
    itemName: "弁当",
    itemAliasesName: "",
    tax: "food",
    itemOptionCheckbox: ["サイズ,S(+100),L(+300)"],
    ...values,
  }) as MenuData;

const orderedMenuItem = (values: Partial<MenuItem>): MenuItem => values as MenuItem;

describe("menuSnapshot", () => {
  it("carries the option groups the customer chose from", () => {
    const snapshot = menuSnapshot(liveMenu({ itemOptionCheckbox: ["サイズ,S,L", "のり"] }));
    assert.deepStrictEqual(snapshot.itemOptionCheckbox, ["サイズ,S,L", "のり"]);
  });

  it("carries the price and the tax category", () => {
    const snapshot = menuSnapshot(liveMenu({ price: 1234, tax: "alcohol" }));
    assert.strictEqual(snapshot.price, 1234);
    assert.strictEqual(snapshot.tax, "alcohol");
  });

  it("records an item with no options as having none, not as unknown", () => {
    const snapshot = menuSnapshot(liveMenu({ itemOptionCheckbox: undefined }));
    assert.deepStrictEqual(snapshot.itemOptionCheckbox, []);
    assert.strictEqual(hasOrderedMenu(snapshot), true);
  });
});

// 写しが使えるかの判定は itemOptionCheckbox の有無ひとつ。値段だけ写しから取ってオプションを
// 生きたメニューから取ると、どちらとも違う金額になりうる。
describe("hasOrderedMenu", () => {
  it("accepts a snapshot written by this version", () => {
    assert.strictEqual(hasOrderedMenu(menuSnapshot(liveMenu({}))), true);
  });

  it("accepts a snapshot whose item simply has no options", () => {
    assert.strictEqual(hasOrderedMenu(orderedMenuItem({ price: 1000, itemOptionCheckbox: [] })), true);
  });

  it("rejects a snapshot written before this version", () => {
    assert.strictEqual(hasOrderedMenu(orderedMenuItem({ price: 1000, tax: "food" })), false);
  });

  it("rejects an order that carries no snapshot for this item", () => {
    assert.strictEqual(hasOrderedMenu(undefined), false);
  });
});

describe("menuForPricing", () => {
  const live = liveMenu({ price: 2000, tax: "alcohol", itemOptionCheckbox: ["のり(+50)"] });

  it("prices from the order's own snapshot when it has one", () => {
    const ordered = orderedMenuItem({ price: 1000, tax: "food", itemOptionCheckbox: ["サイズ,S(+100)"] });
    assert.strictEqual(menuForPricing(ordered, live), ordered);
  });

  it("prices from the live menu when the order has no snapshot", () => {
    assert.strictEqual(menuForPricing(undefined, live), live);
  });

  it("prices from the live menu when the snapshot predates this version", () => {
    assert.strictEqual(menuForPricing(orderedMenuItem({ price: 1000, tax: "food" }), live), live);
  });

  // 半分だけ写しを使うと、どちらとも違う金額になる。
  it("never mixes one side's price with the other side's options", () => {
    const ordered = orderedMenuItem({ price: 1000, tax: "food", itemOptionCheckbox: ["サイズ,S(+100)"] });
    const chosen = menuForPricing(ordered, live);
    assert.strictEqual(chosen.price, ordered.price);
    assert.deepStrictEqual(chosen.itemOptionCheckbox, ordered.itemOptionCheckbox);
    assert.strictEqual(chosen.tax, ordered.tax);

    const fallback = menuForPricing(undefined, live);
    assert.strictEqual(fallback.price, live.price);
    assert.deepStrictEqual(fallback.itemOptionCheckbox, live.itemOptionCheckbox);
    assert.strictEqual(fallback.tax, live.tax);
  });
});
