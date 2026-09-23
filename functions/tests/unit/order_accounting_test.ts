import { describe, it } from "node:test";
import assert from "node:assert";

import { orderAccounting } from "../../src/functions/order/orderCreated";
import { RestaurantInfoData } from "../../src/models/RestaurantInfo";

const YEN = 1;
const CENT = 100;

const restaurant = (values: Partial<RestaurantInfoData>): RestaurantInfoData => values as RestaurantInfoData;

describe("orderAccounting — 外税", () => {
  const exclusive = restaurant({ inclusiveTax: false, foodTax: 8, alcoholTax: 10 });

  it("adds the tax on top of the subtotal", () => {
    const result = orderAccounting(exclusive, 1000, 0, YEN);
    assert.strictEqual(result.sub_total, 1000);
    assert.strictEqual(result.food_tax, 80);
    assert.strictEqual(result.total, 1080);
  });

  it("taxes food and alcohol at their own rates", () => {
    const result = orderAccounting(exclusive, 1000, 1000, YEN);
    assert.strictEqual(result.food_tax, 80);
    assert.strictEqual(result.alcohol_tax, 100);
    assert.strictEqual(result.tax, 180);
    assert.strictEqual(result.total, 2180);
  });

  it("leaves the subtotals untouched", () => {
    const result = orderAccounting(exclusive, 1000, 500, YEN);
    assert.strictEqual(result.food_sub_total, 1000);
    assert.strictEqual(result.alcohol_sub_total, 500);
  });

  it("charges no alcohol tax for an order with no alcohol", () => {
    const result = orderAccounting(exclusive, 1000, 0, YEN);
    assert.strictEqual(result.alcohol_tax, 0);
  });
});

describe("orderAccounting — 内税", () => {
  const inclusive = restaurant({ inclusiveTax: true, foodTax: 8, alcoholTax: 10 });

  it("keeps the total equal to the subtotal", () => {
    const result = orderAccounting(inclusive, 1080, 0, YEN);
    assert.strictEqual(result.total, result.sub_total);
    assert.strictEqual(result.total, 1080);
  });

  it("pulls the tax out of the price the customer pays", () => {
    const result = orderAccounting(inclusive, 1080, 1100, YEN);
    assert.strictEqual(result.food_tax, 80);
    assert.strictEqual(result.alcohol_tax, 100);
    assert.strictEqual(result.food_sub_total, 1000);
    assert.strictEqual(result.alcohol_sub_total, 1000);
    assert.strictEqual(result.total, 2180);
  });

  it("reports which side of the price the tax was on", () => {
    assert.strictEqual(orderAccounting(inclusive, 1080, 0, YEN).inclusiveTax, true);
  });
});

describe("orderAccounting — 設定が欠けている店舗", () => {
  it("treats a missing rate as no tax", () => {
    const result = orderAccounting(restaurant({}), 1000, 500, YEN);
    assert.strictEqual(result.tax, 0);
    assert.strictEqual(result.total, 1500);
  });

  it("treats a missing inclusiveTax as 外税", () => {
    const result = orderAccounting(restaurant({ foodTax: 10 }), 1000, 0, YEN);
    assert.strictEqual(result.inclusiveTax, false);
    assert.strictEqual(result.total, 1100);
  });
});

describe("orderAccounting — 通貨の刻み", () => {
  const exclusive = restaurant({ inclusiveTax: false, foodTax: 8, alcoholTax: 10 });

  it("rounds to whole units for a currency with no fraction", () => {
    assert.strictEqual(orderAccounting(exclusive, 1005, 0, YEN).food_tax, 80);
  });

  it("keeps the fraction for a currency that has one", () => {
    assert.strictEqual(orderAccounting(exclusive, 1005, 0, CENT).food_tax, 80.4);
  });
});

// 0円の注文は注文ではない。ここで止めないと、決済の金額が0のまま先へ進む。
describe("orderAccounting — 0円", () => {
  it("refuses an order that adds up to nothing", () => {
    assert.throws(() => orderAccounting(restaurant({ foodTax: 8 }), 0, 0, YEN), /invalid order/);
  });
});
