import { describe, it } from "node:test";
import assert from "node:assert";

import { extraChargeText, priceString } from "../../src/lib/pdf/pdfText.ts";

describe("priceString", () => {
  it("writes an amount with the currency mark and thousand separators", () => {
    assert.strictEqual(priceString(1500), "¥1,500");
    assert.strictEqual(priceString(0), "¥0");
  });
});

describe("extraChargeText", () => {
  it("writes the shipping cost as an addition", () => {
    assert.strictEqual(
      extraChargeText({ kind: "shipping", amount: 200 }),
      "送料: ¥200",
    );
  });

  // 割引は合計から引かれる。符号が無いと、足される金額に読める。
  it("writes the discount as a subtraction", () => {
    assert.strictEqual(
      extraChargeText({ kind: "discount", amount: 150 }),
      "割引: -¥150",
    );
  });

  // レシート側は「税込」と書いた行を持つが、この2つには消費税が計算されていない。
  it("claims no tax, because none is computed on these amounts", () => {
    assert.ok(!extraChargeText({ kind: "shipping", amount: 200 }).includes("税"));
    assert.ok(!extraChargeText({ kind: "discount", amount: 150 }).includes("税"));
  });

  // どちらの金額かは kind で決まる。金額では見分けられない。
  it("tells the two kinds apart by kind alone", () => {
    const shipping = extraChargeText({ kind: "shipping", amount: 100 });
    const discount = extraChargeText({ kind: "discount", amount: 100 });
    assert.notStrictEqual(shipping, discount);
  });
});
