import { describe, it } from "node:test";
import assert from "node:assert";
import {
  arrayOrNumSum,
  arraySum,
  convOptionArray2Obj,
  convOrderStateForText,
  itemOptionCheckbox2options,
  orderType,
  orderTypeKey,
  priceWithTax,
  taxRate,
} from "../../src/utils/utils.ts";
import { menuFixture } from "../fixtures/menu.ts";
import { orderInfoFixture } from "../fixtures/orderInfo.ts";
import { restaurantInfoFixture } from "../fixtures/restaurantInfo.ts";

// 注文の種別。レポートの列にも通知の文面の鍵にも使われるので、増えた種別が
// 既存の種別に化けると、集計が静かにずれる。
describe("orderType", () => {
  it("calls an EC order EC, whatever else is set", () => {
    assert.strictEqual(orderType(orderInfoFixture({ isEC: true })), "EC");
    assert.strictEqual(
      orderType(orderInfoFixture({ isEC: true, isDelivery: true })),
      "EC",
    );
  });

  it("calls a delivery order Delivery", () => {
    assert.strictEqual(
      orderType(orderInfoFixture({ isEC: false, isDelivery: true })),
      "Delivery",
    );
  });

  it("calls everything else Takeout", () => {
    assert.strictEqual(
      orderType(orderInfoFixture({ isEC: false, isDelivery: false })),
      "Takeout",
    );
  });

  it("builds the message key from the type", () => {
    assert.strictEqual(
      orderTypeKey(orderInfoFixture({ isEC: true })),
      "orderTypeEC",
    );
    assert.strictEqual(
      orderTypeKey(orderInfoFixture({ isEC: false, isDelivery: false })),
      "orderTypeTakeout",
    );
  });
});

// EC の注文は「受取」ではなく「発送」と呼ぶ。2つの状態だけ言い換える。
// 言い換え漏れは、客に「店頭でお受け取りください」と出る形で表に出る。
describe("convOrderStateForText", () => {
  it("renames the two states that mean something else for EC", () => {
    assert.strictEqual(
      convOrderStateForText("ready_to_pickup", { isEC: true }),
      "ready_to_shipping",
    );
    assert.strictEqual(
      convOrderStateForText("transaction_complete", { isEC: true }),
      "shipping_complete",
    );
  });

  it("leaves every other state alone for EC", () => {
    [
      "order_placed",
      "validation_ok",
      "order_accepted",
      "order_canceled",
    ].forEach((state) => {
      assert.strictEqual(convOrderStateForText(state, { isEC: true }), state);
    });
  });

  it("renames nothing when the order is not EC", () => {
    assert.strictEqual(
      convOrderStateForText("ready_to_pickup", { isEC: false }),
      "ready_to_pickup",
    );
    assert.strictEqual(
      convOrderStateForText("transaction_complete", {}),
      "transaction_complete",
    );
  });

  it("tolerates a missing order rather than throwing", () => {
    assert.strictEqual(
      convOrderStateForText("ready_to_pickup", null),
      "ready_to_pickup",
    );
    assert.strictEqual(
      convOrderStateForText("ready_to_pickup", undefined),
      "ready_to_pickup",
    );
  });
});

// 商品に設定されたオプションを、組ごとの選択肢の並びに開く。
describe("itemOptionCheckbox2options", () => {
  it("splits each group on commas", () => {
    assert.deepStrictEqual(
      itemOptionCheckbox2options(["サイズ,S,M,L", "のり"]),
      [["サイズ", "S", "M", "L"], ["のり"]],
    );
  });

  // 店舗オーナーは読みやすさで空白を入れる。残すと選択肢の名前がずれる。
  it("trims the spaces the owner typed around a choice", () => {
    assert.deepStrictEqual(itemOptionCheckbox2options(["サイズ, 小 , 大 "]), [
      ["サイズ", "小", "大"],
    ]);
  });

  // 新規商品の既定は [""]。そのまま開くと「選択肢が1つある空の組」になり、
  // 何も設定していない商品に空の選択欄が出る。
  it("reads a brand-new item's empty default as no options at all", () => {
    assert.deepStrictEqual(itemOptionCheckbox2options([""]), []);
  });

  // 上の逃がしは長さ1のときだけ。2つ空があれば、空の組が2つとして開く。
  it("does not extend that shortcut to two empty groups", () => {
    assert.deepStrictEqual(itemOptionCheckbox2options(["", ""]), [[""], [""]]);
  });

  it("reads an item with no option field as no options", () => {
    assert.deepStrictEqual(itemOptionCheckbox2options([]), []);
    assert.deepStrictEqual(itemOptionCheckbox2options(null), []);
    assert.deepStrictEqual(itemOptionCheckbox2options(undefined), []);
  });
});

describe("convOptionArray2Obj", () => {
  it("keys each entry by its position", () => {
    assert.deepStrictEqual(convOptionArray2Obj({ bento: ["L", "のり"] }), {
      bento: { 0: "L", 1: "のり" },
    });
  });

  it("keeps an entry with no options as an empty holder", () => {
    assert.deepStrictEqual(convOptionArray2Obj({ bento: [] }), { bento: {} });
  });

  it("returns nothing for nothing", () => {
    assert.deepStrictEqual(convOptionArray2Obj({}), {});
  });
});

// 税。taxRate は掛ける数を返し、priceWithTax は丸めた金額を返す。同じ規則を
// 2通りに書いてあるので、片方だけ直すと画面と請求で食い違う。
describe("taxRate と priceWithTax", () => {
  const exclusive = restaurantInfoFixture({
    inclusiveTax: false,
    foodTax: 8,
    alcoholTax: 10,
  });
  const inclusive = restaurantInfoFixture({
    inclusiveTax: true,
    foodTax: 8,
    alcoholTax: 10,
  });
  const food = menuFixture({ tax: "food", price: 1000 });
  const alcohol = menuFixture({ tax: "alcohol", price: 1000 });

  it("multiplies by one when the shop's prices already include tax", () => {
    assert.strictEqual(taxRate(inclusive, food), 1);
    assert.strictEqual(taxRate(inclusive, alcohol), 1);
  });

  it("multiplies by the food rate, and by the alcohol rate for alcohol", () => {
    assert.strictEqual(taxRate(exclusive, food), 1.08);
    assert.strictEqual(taxRate(exclusive, alcohol), 1.1);
  });

  it("prices an item with the same rule, rounded to whole yen", () => {
    assert.strictEqual(priceWithTax(exclusive, food), 1080);
    assert.strictEqual(priceWithTax(exclusive, alcohol), 1100);
    assert.strictEqual(priceWithTax(inclusive, food), 1000);
  });

  it("agrees with taxRate on what the price should be", () => {
    [food, alcohol].forEach((item) => {
      assert.strictEqual(
        priceWithTax(exclusive, item),
        Math.round(taxRate(exclusive, item) * item.price),
      );
    });
  });

  it("rounds rather than truncating", () => {
    const odd = menuFixture({ tax: "food", price: 999 });
    assert.strictEqual(priceWithTax(exclusive, odd), Math.round(999 * 1.08));
  });
});

// 個数の合計。カートのボタンと注文一覧の点数がこれを通る。
describe("arraySum / arrayOrNumSum", () => {
  it("adds up the quantities of one item", () => {
    assert.strictEqual(arraySum([1, 2, 3]), 6);
    assert.strictEqual(arraySum([5]), 5);
    assert.strictEqual(arraySum([0, 0]), 0);
  });

  it("takes a bare number as itself", () => {
    assert.strictEqual(arrayOrNumSum(5), 5);
    assert.strictEqual(arrayOrNumSum(0), 0);
  });

  it("adds up an array the same way arraySum does", () => {
    assert.strictEqual(arrayOrNumSum([1, 2, 3]), 6);
  });

  // 空の配列で投げる。`arr || [0]` は空配列を素通しし、初期値なしの reduce が空で投げるため。
  // いまの呼び手（カートの点数・注文一覧の集計）に空が届くかは確かめていないので、
  // ここでは直さず、そうなっていることだけを留める。届くようになれば、この試験が根拠になる。
  it("throws on an empty array instead of counting nothing", () => {
    assert.throws(() => arraySum([]), TypeError);
    assert.throws(() => arrayOrNumSum([]), TypeError);
  });

  it("reads a missing list as a single zero", () => {
    assert.strictEqual(arrayOrNumSum(0), 0);
  });
});
