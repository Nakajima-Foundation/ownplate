import { describe, it } from "node:test";
import assert from "node:assert";

import { getUpdateOrder } from "../../src/functions/stripe/orderChange";

// 店主が注文の一部を取り消すと、残った行を先頭から詰め直す。選んだオプションは
// 位置で保存されているので、詰め直しで options / rawOptions が行についてこないと、
// 客が選んでいないオプションの注文になる。
const order = { bento: [2, 1, 3] };
const options = { bento: { 0: ["大盛り"], 1: ["普通"], 2: ["小盛り"] } };
const rawOptions = { bento: { 0: [2], 1: [1], 2: [0] } };

describe("getUpdateOrder", () => {
  it("keeps every line when nothing is removed", () => {
    const result = getUpdateOrder(
      [
        { menuId: "bento", index: 0 },
        { menuId: "bento", index: 1 },
        { menuId: "bento", index: 2 },
      ],
      order,
      options,
      rawOptions,
    );
    assert.deepStrictEqual(result.updateOrderData, { bento: [2, 1, 3] });
    assert.deepStrictEqual(result.updateOptions, {
      bento: { 0: ["大盛り"], 1: ["普通"], 2: ["小盛り"] },
    });
    assert.deepStrictEqual(result.updateRawOptions, {
      bento: { 0: [2], 1: [1], 2: [0] },
    });
  });

  it("moves each line's options with the line when one is dropped", () => {
    const result = getUpdateOrder(
      [
        { menuId: "bento", index: 0 },
        { menuId: "bento", index: 2 },
      ],
      order,
      options,
      rawOptions,
    );
    assert.deepStrictEqual(result.updateOrderData, { bento: [2, 3] });
    assert.deepStrictEqual(result.updateOptions, {
      bento: { 0: ["大盛り"], 1: ["小盛り"] },
    });
    assert.deepStrictEqual(result.updateRawOptions, {
      bento: { 0: [2], 1: [0] },
    });
  });

  it("follows the order it is given, not the stored order", () => {
    const result = getUpdateOrder(
      [
        { menuId: "bento", index: 2 },
        { menuId: "bento", index: 0 },
      ],
      order,
      options,
      rawOptions,
    );
    assert.deepStrictEqual(result.updateOrderData, { bento: [3, 2] });
    assert.deepStrictEqual(result.updateOptions, {
      bento: { 0: ["小盛り"], 1: ["大盛り"] },
    });
  });

  it("keeps each menu separate", () => {
    const twoMenus = { bento: [1], drink: [5, 6] };
    const twoOptions = { bento: { 0: ["A"] }, drink: { 0: ["B"], 1: ["C"] } };
    const result = getUpdateOrder(
      [
        { menuId: "drink", index: 1 },
        { menuId: "bento", index: 0 },
      ],
      twoMenus,
      twoOptions,
      twoOptions,
    );
    assert.deepStrictEqual(result.updateOrderData, { drink: [6], bento: [1] });
    assert.deepStrictEqual(result.updateOptions, {
      drink: { 0: ["C"] },
      bento: { 0: ["A"] },
    });
  });

  it("drops everything when nothing survives", () => {
    const result = getUpdateOrder([], order, options, rawOptions);
    assert.deepStrictEqual(result.updateOrderData, {});
    assert.deepStrictEqual(result.updateOptions, {});
    assert.deepStrictEqual(result.updateRawOptions, {});
  });

  it("ignores a line that is not in the order", () => {
    const result = getUpdateOrder(
      [
        { menuId: "bento", index: 9 },
        { menuId: "nosuchmenu", index: 0 },
        { menuId: "bento", index: 1 },
      ],
      order,
      options,
      rawOptions,
    );
    assert.deepStrictEqual(result.updateOrderData, { bento: [1] });
    assert.deepStrictEqual(result.updateOptions, { bento: { 0: ["普通"] } });
  });

  // 数量 0 は「空」ではない。取り消しは行ごと外す操作で、0 を残すのとは別。
  it("keeps a line whose quantity is zero", () => {
    const withZero = { bento: [0, 1] };
    const result = getUpdateOrder([{ menuId: "bento", index: 0 }], withZero, { bento: { 0: ["A"], 1: ["B"] } }, { bento: { 0: [0], 1: [1] } });
    assert.deepStrictEqual(result.updateOrderData, { bento: [0] });
  });

  it("does not modify what it was given", () => {
    const before = JSON.stringify({ order, options, rawOptions });
    getUpdateOrder([{ menuId: "bento", index: 1 }], order, options, rawOptions);
    assert.strictEqual(JSON.stringify({ order, options, rawOptions }), before);
  });
});
