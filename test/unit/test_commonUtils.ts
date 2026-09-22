import { describe, it } from "node:test";
import assert from "node:assert";

import { isReducedTaxRate } from "../../src/utils/commonUtils.ts";

describe("isReducedTaxRate", () => {
  // 画面の選択肢は「8% 軽減税率が適用される飲食料品」と「10% それ以外(酒、グッズなど)」。
  // 保存される値は後者だけが "alcohol" で、前者は別の値になる。
  it("treats alcohol as the standard rate", () => {
    assert.strictEqual(isReducedTaxRate({ tax: "alcohol" }), false);
  });

  it("treats food as the reduced rate", () => {
    assert.strictEqual(isReducedTaxRate({ tax: "food" }), true);
  });

  // 税区分が入っていない古いメニューは軽減税率として扱う。これは orderAccounting が
  // 同じ判定（"alcohol" 以外は foodTax）をしているのに合わせたもので、印だけが
  // 食い違うと「8%対象なのに ※ が無い」行ができる。
  it("matches what the tax calculation does for an item with no category", () => {
    assert.strictEqual(isReducedTaxRate({}), true);
    assert.strictEqual(isReducedTaxRate({ tax: "" }), true);
    assert.strictEqual(isReducedTaxRate(undefined), true);
  });
});
