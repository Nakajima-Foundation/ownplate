import { describe, it } from "node:test";
import assert from "node:assert";

import {
  isReducedTaxRate,
  isValidInvoiceNumber,
} from "../../src/utils/commonUtils.ts";

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

describe("isValidInvoiceNumber", () => {
  const valid = "T1234567890123";

  it("accepts the legal shape", () => {
    assert.strictEqual(isValidInvoiceNumber(valid), true);
  });

  // 免税事業者は番号を持たない。必須にすると入力欄で詰まる。
  it("accepts an unset number", () => {
    assert.strictEqual(isValidInvoiceNumber(undefined), true);
    assert.strictEqual(isValidInvoiceNumber(""), true);
  });

  it("rejects a wrong digit count", () => {
    assert.strictEqual(isValidInvoiceNumber("T123456789012"), false);
    assert.strictEqual(isValidInvoiceNumber("T12345678901234"), false);
  });

  it("rejects a missing or lowercase prefix", () => {
    assert.strictEqual(isValidInvoiceNumber("1234567890123"), false);
    assert.strictEqual(isValidInvoiceNumber("t1234567890123"), false);
  });

  it("rejects the separators people actually type", () => {
    assert.strictEqual(isValidInvoiceNumber("T123456789012X"), false);
    assert.strictEqual(isValidInvoiceNumber("T1234-5678-90123"), false);
    assert.strictEqual(isValidInvoiceNumber("T 1234567890123"), false);
  });

  // 空白は弾く。通すと空白つきの番号がそのまま請求書に印字される。
  it("rejects surrounding whitespace rather than trimming it", () => {
    assert.strictEqual(isValidInvoiceNumber(` ${valid}`), false);
    assert.strictEqual(isValidInvoiceNumber(`${valid}\n`), false);
  });
});
