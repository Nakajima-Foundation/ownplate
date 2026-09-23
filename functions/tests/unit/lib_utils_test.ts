import { describe, it } from "node:test";
import assert from "node:assert";

import { filterData, isEmpty, nameOfOrder, get_delivery_cost } from "../../src/lib/utils";

// Firestore は undefined を受け取ると書き込みごと失敗する。filterData はその手前で間引く。
describe("filterData", () => {
  it("drops the keys Firestore refuses", () => {
    assert.deepStrictEqual(filterData({ a: 1, b: null, c: undefined }), { a: 1 });
  });

  it("keeps the values that only look empty", () => {
    assert.deepStrictEqual(filterData({ zero: 0, blank: "", no: false, list: [] }), {
      zero: 0,
      blank: "",
      no: false,
      list: [],
    });
  });

  it("returns nothing for an object with nothing to keep", () => {
    assert.deepStrictEqual(filterData({ a: null, b: undefined }), {});
  });

  it("does not modify what it was given", () => {
    const original = { a: 1, b: null };
    filterData(original);
    assert.deepStrictEqual(original, { a: 1, b: null });
  });
});

describe("isEmpty", () => {
  it("calls null, undefined and the empty string empty", () => {
    [null, undefined, ""].forEach((value) => assert.strictEqual(isEmpty(value), true));
  });

  it("does not call zero or false empty", () => {
    [0, false, [], {}, "0", " "].forEach((value) => assert.strictEqual(isEmpty(value), false));
  });
});

describe("nameOfOrder", () => {
  it("pads the number to three digits", () => {
    assert.strictEqual(nameOfOrder(1), "#001");
    assert.strictEqual(nameOfOrder(42), "#042");
    assert.strictEqual(nameOfOrder(999), "#999");
  });

  it("keeps the last three digits once the counter passes a thousand", () => {
    assert.strictEqual(nameOfOrder(1234), "#234");
  });

  it("accepts a number stored as a string", () => {
    assert.strictEqual(nameOfOrder("7"), "#007");
  });
});

describe("get_delivery_cost", () => {
  const delivery = { deliveryFee: 300, enableDeliveryFree: true, deliveryFreeThreshold: 3000 };

  it("charges nothing when the order is not a delivery", () => {
    assert.strictEqual(get_delivery_cost({ isDelivery: false }, delivery, 5000), 0);
  });

  it("charges the fee below the free threshold", () => {
    assert.strictEqual(get_delivery_cost({ isDelivery: true }, delivery, 2999), 300);
  });

  // 閾値ちょうどは無料側。ここを取り違えると1円差で請求が変わる。
  it("is free exactly at the threshold", () => {
    assert.strictEqual(get_delivery_cost({ isDelivery: true }, delivery, 3000), 0);
    assert.strictEqual(get_delivery_cost({ isDelivery: true }, delivery, 3001), 0);
  });

  it("charges the fee at any total when free delivery is off", () => {
    const noFree = { deliveryFee: 300, enableDeliveryFree: false, deliveryFreeThreshold: 3000 };
    assert.strictEqual(get_delivery_cost({ isDelivery: true }, noFree, 100000), 300);
  });

  it("charges nothing when the shop set no fee", () => {
    assert.strictEqual(get_delivery_cost({ isDelivery: true }, {}, 100), 0);
  });
});
