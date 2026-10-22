import { describe, it } from "node:test";
import assert from "node:assert";

import { buildOrderLines, invalidOrderKind } from "../../src/lib/orderLines";

const YEN = 1;

const karaage = { price: 500, itemName: "からあげ", tax: "food", itemOptionCheckbox: ["大盛り (+150)", "小 (-50),並,大 (+100)"] };
const beer = { price: 600, itemName: "ビール", tax: "alcohol" };

describe("buildOrderLines", () => {
  it("prices each line from the menu, with options, times the quantity", () => {
    const lines = buildOrderLines(
      { karaage },
      {
        order: { karaage: [2, 1] },
        rawOptions: {
          karaage: [
            [true, 2],
            [false, 0],
          ],
        },
      },
      YEN,
    );
    assert.deepStrictEqual(lines.newOrderData, { karaage: [2, 1] });
    assert.deepStrictEqual(lines.newPrices, { karaage: [(500 + 150 + 100) * 2, (500 - 50) * 1] });
    assert.deepStrictEqual(lines.newOptions, {
      karaage: [
        ["大盛り (+150)", "大 (+100)"],
        ["", "小 (-50)"],
      ],
    });
    assert.strictEqual(lines.food_sub_total, 1500 + 450);
    assert.strictEqual(lines.alcohol_sub_total, 0);
  });

  it("adds alcohol to the alcohol subtotal and everything else to food", () => {
    const lines = buildOrderLines({ karaage, beer, water: { price: 100, itemName: "水" } }, { order: { karaage: 1, beer: 2, water: 1 } }, YEN);
    assert.strictEqual(lines.food_sub_total, 500 + 100);
    assert.strictEqual(lines.alcohol_sub_total, 1200);
  });

  it("drops a sold-out menu from every part of the result", () => {
    const lines = buildOrderLines({ karaage: { ...karaage, soldOut: true }, beer }, { order: { karaage: 1, beer: 1 } }, YEN);
    assert.deepStrictEqual(Object.keys(lines.newOrderData), ["beer"]);
    assert.deepStrictEqual(Object.keys(lines.newPrices), ["beer"]);
    assert.deepStrictEqual(Object.keys(lines.newOptions), ["beer"]);
    assert.deepStrictEqual(Object.keys(lines.newItems), ["beer"]);
    assert.strictEqual(lines.food_sub_total, 0);
  });

  it("skips a zero-quantity line but keeps the others of the same menu", () => {
    const lines = buildOrderLines({ karaage }, { order: { karaage: [0, 3] }, rawOptions: { karaage: [[true], [false]] } }, YEN);
    assert.deepStrictEqual(lines.newOrderData, { karaage: [3] });
    assert.deepStrictEqual(lines.newPrices, { karaage: [1500] });
    assert.deepStrictEqual(lines.newOptions, { karaage: [[""]] });
  });

  it("throws on a negative or non-integer quantity", () => {
    assert.throws(() => buildOrderLines({ karaage }, { order: { karaage: -1 } }, YEN), /negative number/);
    assert.throws(() => buildOrderLines({ karaage }, { order: { karaage: 1.5 } }, YEN), /not integer/);
    assert.throws(() => buildOrderLines({ karaage }, { order: { karaage: [1, Number.NaN] } }, YEN), /not integer/);
  });

  it("copies the menu into the order with defaults for missing fields", () => {
    const lines = buildOrderLines({ beer }, { order: { beer: 1 } }, YEN);
    assert.deepStrictEqual(lines.newItems.beer, {
      price: 600,
      itemName: "ビール",
      itemPhoto: undefined,
      images: undefined,
      itemAliasesName: "",
      category1: "",
      category2: "",
      exceptDay: {},
      exceptHour: {},
      tax: "alcohol",
    });
  });

  // 注文・値段・オプション名は同じ添字で読まれる（src/utils/utils.ts の getOrderItems）。
  it("keeps quantity, price and option names aligned, and the subtotals equal to the line prices", () => {
    const seed = 20260929;
    const next = (state: number) => (state * 1103515245 + 12345) % 2147483648;
    const cases = Array.from({ length: 300 }, (_, index) => {
      const state = next(seed + index);
      const quantities = [state % 3, next(state) % 4, next(next(state)) % 2];
      const options = quantities.map((_quantity, line) => [line % 2 === 0, next(state + line) % 3]);
      return { quantities, options, soldOut: state % 7 === 0 };
    });
    cases.forEach(({ quantities, options, soldOut }) => {
      const lines = buildOrderLines({ karaage: { ...karaage, soldOut }, beer }, { order: { karaage: quantities, beer: quantities }, rawOptions: { karaage: options } }, YEN);
      Object.keys(lines.newOrderData).forEach((menuId) => {
        assert.strictEqual(lines.newPrices[menuId].length, lines.newOrderData[menuId].length, `seed ${seed}`);
        assert.strictEqual(lines.newOptions[menuId].length, lines.newOrderData[menuId].length, `seed ${seed}`);
      });
      const sum = (menuId: string) => (lines.newPrices[menuId] ?? []).reduce((total, price) => total + price, 0);
      assert.strictEqual(lines.food_sub_total, sum("karaage"), `seed ${seed}`);
      assert.strictEqual(lines.alcohol_sub_total, sum("beer"), `seed ${seed}`);
    });
  });
});

describe("invalidOrderKind", () => {
  const shop = { enableDelivery: true, supportLiff: true, enableLunchDinner: false };

  it("accepts what the shop supports", () => {
    assert.strictEqual(invalidOrderKind(shop, {}), undefined);
    assert.strictEqual(invalidOrderKind(shop, { isDelivery: true, isLiff: true }), undefined);
    assert.strictEqual(invalidOrderKind({ ...shop, enableLunchDinner: true }, { lunchOrDinner: "lunch" }), undefined);
    assert.strictEqual(invalidOrderKind({ ...shop, enableLunchDinner: true }, { lunchOrDinner: "dinner" }), undefined);
  });

  it("rejects delivery or LINE orders the shop does not take", () => {
    assert.strictEqual(invalidOrderKind({ ...shop, enableDelivery: false }, { isDelivery: true }), "Invalid delivery order.");
    assert.strictEqual(invalidOrderKind({ ...shop, supportLiff: false }, { isLiff: true }), "Invalid liff order.");
  });

  it("requires lunch or dinner exactly when the shop splits them", () => {
    ["", "brunch", undefined].forEach((lunchOrDinner) => {
      assert.strictEqual(invalidOrderKind({ ...shop, enableLunchDinner: true }, { lunchOrDinner }), "Invalid lunch dinner order.");
    });
    assert.strictEqual(invalidOrderKind(shop, { lunchOrDinner: "lunch" }), "Invalid lunch dinner order.");
    assert.strictEqual(invalidOrderKind(shop, { lunchOrDinner: "" }), undefined);
  });

  it("reports delivery before LINE before lunch/dinner", () => {
    assert.strictEqual(invalidOrderKind({ enableDelivery: false, supportLiff: false, enableLunchDinner: true }, { isDelivery: true, isLiff: true }), "Invalid delivery order.");
    assert.strictEqual(invalidOrderKind({ enableDelivery: true, supportLiff: false, enableLunchDinner: true }, { isLiff: true }), "Invalid liff order.");
  });
});
