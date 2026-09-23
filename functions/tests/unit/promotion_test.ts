import { describe, it } from "node:test";
import assert from "node:assert";

import { getDiscountPrice } from "../../src/functions/order/promotion";
import { PromotionData } from "../../src/lib/types/promotion";

const promotion = (values: Partial<PromotionData>): PromotionData => values as PromotionData;

describe("getDiscountPrice", () => {
  it("takes the stated amount off when the promotion is an amount", () => {
    const result = getDiscountPrice(promotion({ discountMethod: "amount", discountValue: 300 }), 5000);
    assert.strictEqual(result, 300);
  });

  it("ignores the order total when the promotion is an amount", () => {
    const amountOff = promotion({ discountMethod: "amount", discountValue: 300 });
    assert.strictEqual(getDiscountPrice(amountOff, 100), getDiscountPrice(amountOff, 100000));
  });

  it("takes a share of the total when the promotion is a percentage", () => {
    const result = getDiscountPrice(promotion({ discountMethod: "percentage", discountValue: 10 }), 5000);
    assert.strictEqual(result, 500);
  });

  // 割り切れない率。端数をここで丸めていないことを固定しておく。
  it("does not round the share it computes", () => {
    const result = getDiscountPrice(promotion({ discountMethod: "percentage", discountValue: 33 }), 1000);
    assert.strictEqual(result, 330);
    assert.strictEqual(getDiscountPrice(promotion({ discountMethod: "percentage", discountValue: 7 }), 1005), 70.35);
  });

  it("discounts nothing for a zero promotion", () => {
    assert.strictEqual(getDiscountPrice(promotion({ discountMethod: "percentage", discountValue: 0 }), 5000), 0);
    assert.strictEqual(getDiscountPrice(promotion({ discountMethod: "amount", discountValue: 0 }), 5000), 0);
  });
});
