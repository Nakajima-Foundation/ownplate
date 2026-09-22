import { describe, it } from "node:test";
import assert from "node:assert";

import { buildReceiptText, hasReducedTaxItem, itemMark, reducedTaxNote, taxCategories, taxLines } from "../src/functions/express/receiptFormat";

const food = { revenue: 1000, tax: 74 };
const alcohol = { revenue: 500, tax: 45 };

describe("taxCategories", () => {
  it("splits the order by rate, food first", () => {
    assert.deepStrictEqual(taxCategories({ food, alcohol }, 8, 10), [
      { rate: 8, revenue: 1000, tax: 74 },
      { rate: 10, revenue: 500, tax: 45 },
    ]);
  });

  // 0円の行はレシートを長くするだけで、「その税率の取引があった」と誤読させる
  it("leaves out a category with no revenue", () => {
    assert.deepStrictEqual(taxCategories({ food }, 8, 10), [{ rate: 8, revenue: 1000, tax: 74 }]);
    assert.deepStrictEqual(taxCategories({ alcohol }, 8, 10), [{ rate: 10, revenue: 500, tax: 45 }]);
  });

  // 率をベタ書きすると、税率が変わったとき金額は正しいのに表示だけ嘘になる
  it("takes the rate from the caller rather than assuming 8 and 10", () => {
    assert.deepStrictEqual(taxCategories({ food, alcohol }, 1, 10), [
      { rate: 1, revenue: 1000, tax: 74 },
      { rate: 10, revenue: 500, tax: 45 },
    ]);
  });

  it("returns nothing for an order with no accounting at all", () => {
    assert.deepStrictEqual(taxCategories(undefined, 8, 10), []);
    assert.deepStrictEqual(taxCategories({}, 8, 10), []);
  });

  // 税額だけあって売上が無い形は出さない。区分として意味を成さない。
  it("leaves out a category that has tax but no revenue", () => {
    assert.deepStrictEqual(taxCategories({ food: { revenue: 0, tax: 74 } }, 8, 10), []);
  });
});

describe("taxLines", () => {
  it("writes one pair of lines per category", () => {
    assert.strictEqual(taxLines(taxCategories({ food, alcohol }, 8, 10), "内税", 119), "8%対象 | ¥1000\n消費税（内税） | ¥74\n10%対象 | ¥500\n消費税（内税） | ¥45");
  });

  // accounting を持たない古い注文。区分が出せないときに何も出さないと、
  // 消費税の記載そのものが消える。
  it("falls back to the single total for an order with no breakdown", () => {
    assert.strictEqual(taxLines([], "外税", 119), "消費税（外税） | ¥119");
  });

  it("carries the inclusive/exclusive wording through", () => {
    assert.ok(taxLines(taxCategories({ food }, 8, 10), "外税", 74).includes("消費税（外税）"));
  });
});

describe("hasReducedTaxItem", () => {
  const menuItems = { bento: { tax: "food" }, beer: { tax: "alcohol" } };

  it("is true when any ordered item is reduced-rate", () => {
    assert.strictEqual(hasReducedTaxItem(menuItems, ["bento", "beer"]), true);
    assert.strictEqual(hasReducedTaxItem(menuItems, ["bento"]), true);
  });

  it("is false when every ordered item is standard-rate", () => {
    assert.strictEqual(hasReducedTaxItem(menuItems, ["beer"]), false);
  });

  // 注文されていない商品は見ない。メニューに弁当があっても、ビールだけの
  // 注文に「※軽減税率対象」と出てはいけない。
  it("looks only at what was ordered", () => {
    assert.strictEqual(hasReducedTaxItem(menuItems, []), false);
  });

  // 税区分が入っていない古いメニューは軽減税率として計算されるので、印も付ける
  it("treats an item with no category the way the tax calculation does", () => {
    assert.strictEqual(hasReducedTaxItem({ old: {} }, ["old"]), true);
  });
});

describe("reducedTaxNote", () => {
  it("explains the mark only when a mark was printed", () => {
    assert.strictEqual(reducedTaxNote(true), "※軽減税率対象");
    assert.strictEqual(reducedTaxNote(false), "");
  });
});

describe("itemMark", () => {
  it("marks reduced-rate items and leaves the others alone", () => {
    assert.strictEqual(itemMark({ tax: "food" }), "※");
    assert.strictEqual(itemMark({ tax: "alcohol" }), "");
  });

  it("marks an item with no category, matching the calculation", () => {
    assert.strictEqual(itemMark({}), "※");
    assert.strictEqual(itemMark(undefined), "※");
  });

  // 凡例と印は同じ判定から出る。食い違うと、印のあるレシートに凡例が無い状態になる。
  it("agrees with the note for the same items", () => {
    const menuItems = { a: { tax: "alcohol" } };
    assert.strictEqual(itemMark(menuItems.a), "");
    assert.strictEqual(reducedTaxNote(hasReducedTaxItem(menuItems, ["a"])), "");
  });
});

// ---- 組み立てたテキストそのものを見る ----
// receiptline に渡る手前の文字列。ここが正しければ、あとは receiptline の仕事。

const dummyRestaurant = (extra = {}) => ({
  restaurantName: "テスト店",
  inclusiveTax: true,
  foodTax: 8,
  alcoholTax: 10,
  ...extra,
});

const dummyOrder = (extra = {}) => ({
  number: 653,
  name: "山田",
  isDelivery: false,
  timePlaced: { toDate: () => new Date("2026-09-22T03:00:00Z") },
  order: { bento: { 0: 2 }, beer: { 0: 1 } },
  menuItems: {
    bento: { itemName: "から揚げ弁当", tax: "food" },
    beer: { itemName: "ビール", tax: "alcohol" },
  },
  options: {},
  total: 1500,
  tax: 119,
  deliveryFee: 0,
  tip: 0,
  totalCharge: 1500,
  accounting: { food: { revenue: 1000, tax: 74 }, alcohol: { revenue: 500, tax: 45 } },
  payment: {},
  ...extra,
});

describe("buildReceiptText", () => {
  it("marks only the reduced-rate item and explains the mark", () => {
    const text = buildReceiptText(dummyRestaurant(), dummyOrder());
    assert.ok(text.includes("から揚げ弁当※ | x2"));
    assert.ok(text.includes("ビール | x1"));
    assert.ok(text.includes("※軽減税率対象"));
  });

  it("splits the tax by rate, using the restaurant's own rates", () => {
    const text = buildReceiptText(dummyRestaurant(), dummyOrder());
    assert.ok(text.includes("8%対象 | ¥1000"));
    assert.ok(text.includes("10%対象 | ¥500"));
    assert.ok(text.includes("消費税（内税） | ¥74"));
    assert.ok(text.includes("消費税（内税） | ¥45"));
  });

  // 率をベタ書きしていたら、ここが 8/10 のまま変わらない
  it("follows a change of the restaurant's tax rate", () => {
    const text = buildReceiptText(dummyRestaurant({ foodTax: 1 }), dummyOrder());
    assert.ok(text.includes("1%対象 | ¥1000"));
    assert.ok(!text.includes("8%対象"));
  });

  it("says 外税 when the restaurant prices exclude tax", () => {
    const text = buildReceiptText(dummyRestaurant({ inclusiveTax: false }), dummyOrder());
    assert.ok(text.includes("消費税（外税） | ¥74"));
    assert.ok(!text.includes("消費税（内税）"));
  });

  // 軽減税率の商品が無い注文に、指す先の無い凡例を残さない
  it("leaves out the mark and the note when nothing is reduced-rate", () => {
    const text = buildReceiptText(
      dummyRestaurant(),
      dummyOrder({
        order: { beer: { 0: 1 } },
        menuItems: { beer: { itemName: "ビール", tax: "alcohol" } },
        accounting: { alcohol: { revenue: 500, tax: 45 } },
      }),
    );
    assert.ok(text.includes("ビール | x1"));
    assert.ok(!text.includes("※"));
  });

  // #1782 以前の注文は accounting を持たない。区分が出せないときに何も出さないと
  // 消費税の記載そのものが消える。
  it("falls back to the single tax line for an order with no accounting", () => {
    const text = buildReceiptText(dummyRestaurant(), dummyOrder({ accounting: undefined }));
    assert.ok(text.includes("消費税（内税） | ¥119"));
    assert.ok(!text.includes("%対象"));
  });

  it("carries the order number, the customer and the handover method", () => {
    const text = buildReceiptText(dummyRestaurant(), dummyOrder());
    assert.ok(text.includes("テスト店"));
    assert.ok(text.includes("山田さん"));
    assert.ok(text.includes("テイクアウト"));
    assert.ok(text.includes("合計 | ^^^¥1500"));
  });

  it("says デリバリー for a delivery order", () => {
    const text = buildReceiptText(dummyRestaurant(), dummyOrder({ isDelivery: true }));
    assert.ok(text.includes("デリバリー"));
  });

  it("says 事前クレジット決済 when the order was paid by card", () => {
    const text = buildReceiptText(dummyRestaurant(), dummyOrder({ payment: { stripe: {} } }));
    assert.ok(text.includes("事前クレジット決済"));
    assert.ok(!text.includes("現地払い"));
  });
});
