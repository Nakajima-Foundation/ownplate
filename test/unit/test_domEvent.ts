import { describe, it } from "node:test";
import assert from "node:assert";

import { inputValueOf } from "../../src/utils/domEvent.ts";

// 入力欄の値の取り出し。使えるものが無ければ空欄として扱う。
describe("inputValueOf", () => {
  it("takes the string the input holds", () => {
    assert.strictEqual(inputValueOf({ target: { value: "18" } }), "18");
  });

  it("passes an empty input through as empty", () => {
    assert.strictEqual(inputValueOf({ target: { value: "" } }), "");
  });

  it("keeps a numeric value rather than discarding it", () => {
    assert.strictEqual(inputValueOf({ target: { value: 540 } }), "540");
    assert.strictEqual(inputValueOf({ target: { value: 0 } }), "0");
    assert.strictEqual(inputValueOf({ target: { value: NaN } }), "NaN");
  });

  it("treats a missing target as empty", () => {
    assert.strictEqual(inputValueOf({ target: null }), "");
    assert.strictEqual(inputValueOf({ target: undefined }), "");
  });

  it("treats a target without a usable value as empty", () => {
    assert.strictEqual(inputValueOf({ target: {} }), "");
    assert.strictEqual(inputValueOf({ target: { value: null } }), "");
    assert.strictEqual(inputValueOf({ target: { value: true } }), "");
    assert.strictEqual(inputValueOf({ target: { value: Symbol("s") } }), "");
    assert.strictEqual(inputValueOf({ target: { value: {} } }), "");
    assert.strictEqual(inputValueOf({ target: { value: new String("x") } }), "");
    assert.strictEqual(inputValueOf({ target: "text" }), "");
  });

  it("reaches a value carried on the prototype", () => {
    assert.strictEqual(
      inputValueOf({ target: Object.create({ value: "x" }) }),
      "x",
    );
  });

  it("reaches a value that is not enumerable", () => {
    const target = {};
    Object.defineProperty(target, "value", { value: "9", enumerable: false });
    assert.strictEqual(inputValueOf({ target }), "9");
  });

  // 守りで検めた値と返す値が食い違わないこと。二度読むと食い違う。
  it("reads the value once, so a changing accessor cannot slip past the check", () => {
    let reads = 0;
    const target = {};
    Object.defineProperty(target, "value", {
      get: () => {
        reads += 1;
        return reads === 1 ? "first" : 12345;
      },
    });
    assert.strictEqual(inputValueOf({ target }), "first");
    assert.strictEqual(reads, 1);
  });

  it("treats a value that cannot be read as empty", () => {
    const target = {};
    Object.defineProperty(target, "value", {
      get: () => {
        throw new Error("unreadable");
      },
    });
    assert.strictEqual(inputValueOf({ target }), "");
  });
});
