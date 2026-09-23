import { describe, it } from "node:test";
import assert from "node:assert";
import {
  getPostOption,
  getPriceWithTax,
  getPrices,
  getTrimmedSelectedOptions,
  prices2subtotal,
  subtotal2total,
} from "../../src/utils/utils.ts";
import { menuFixture } from "../fixtures/menu.ts";
import { restaurantInfoFixture } from "../fixtures/restaurantInfo.ts";

// この試験が読めること自体が、getShopOwner を切り出した効果。utils.ts が firebase9 を
// 読み込むあいだは、import した時点で initializeApp と initializeAppCheck が走って
// ここへ来られなかった。firebase を utils.ts へ戻すと、この試験は丸ごと落ちる。
//
// 画面が出す金額とオプション名はこの連鎖で決まる。サーバは注文を受けたあと rawOptions から
// 同じものを作り直す（ownplate#1825）ので、ここがずれると客が見た額と請求額が食い違う。

const YEN = 1;

const bento = menuFixture({
  price: 1000,
  itemOptionCheckbox: ["サイズ,S(+100),M(+200),L(+300)", "のり(+50)"],
});

describe("カートの金額", () => {
  const cartItems = { bento };

  const totalOf = (
    orders: { [key: string]: number[] },
    selected: { [key: string]: (boolean | string | number)[][] },
  ) => {
    const trimmed = getTrimmedSelectedOptions(orders, cartItems, selected);
    const prices = getPrices(YEN, orders, cartItems, trimmed);
    return prices2subtotal(prices);
  };

  it("adds the chosen option to the item's own price", () => {
    assert.strictEqual(
      totalOf({ bento: [1] }, { bento: [[3, true]] }).bento,
      1350,
    );
  });

  it("charges nothing extra when no option is chosen", () => {
    assert.strictEqual(
      totalOf({ bento: [1] }, { bento: [[0, false]] }).bento,
      1000,
    );
  });

  it("multiplies by how many were ordered", () => {
    assert.strictEqual(
      totalOf({ bento: [2] }, { bento: [[3, true]] }).bento,
      2700,
    );
  });

  // 同じ商品を違うオプションで2つ頼める。行ごとに別々に計算される。
  it("prices each line of the same item separately", () => {
    const subTotal = totalOf(
      { bento: [1, 2] },
      {
        bento: [
          [3, true],
          [1, false],
        ],
      },
    );
    assert.strictEqual(subTotal.bento, 1350 + 1100 * 2);
  });

  it("charges nothing for a cart with no orders", () => {
    assert.deepStrictEqual(totalOf({}, {}), {});
  });
});

// 外税の店舗では税が上に乗り、内税では乗らない。ここを取り違えると請求額が8%ずれる。
describe("税の乗せ方", () => {
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

  it("adds the food rate on top for a tax-exclusive shop", () => {
    assert.strictEqual(
      getPriceWithTax(1000, menuFixture({ tax: "food" }), exclusive),
      1080,
    );
  });

  it("adds the alcohol rate for alcohol", () => {
    assert.strictEqual(
      getPriceWithTax(1000, menuFixture({ tax: "alcohol" }), exclusive),
      1100,
    );
  });

  it("adds nothing for a tax-inclusive shop", () => {
    assert.strictEqual(
      getPriceWithTax(1000, menuFixture({ tax: "food" }), inclusive),
      1000,
    );
    assert.strictEqual(
      getPriceWithTax(1000, menuFixture({ tax: "alcohol" }), inclusive),
      1000,
    );
  });

  it("totals the cart with each item under its own rate", () => {
    const cartItems = {
      food: menuFixture({ tax: "food" }),
      drink: menuFixture({ tax: "alcohol" }),
    };
    const total = subtotal2total(
      { food: 1000, drink: 1000 },
      cartItems,
      exclusive,
    );
    assert.strictEqual(total, 1080 + 1100);
  });
});

// 注文と一緒に保存される「選んだ選択肢の名前」。レシートと通知に出る。
describe("選んだ選択肢の名前", () => {
  const cartItems = { bento };

  it("names what the customer actually picked", () => {
    const trimmed = getTrimmedSelectedOptions({ bento: [1] }, cartItems, {
      bento: [[3, true]],
    });
    assert.deepStrictEqual(getPostOption(trimmed, cartItems).bento, [
      ["L(+300)", "のり(+50)"],
    ]);
  });

  // 金額と名前は同じ選択から出る。片方だけずれるとレシートと請求額が食い違う。
  it("names the choice the price was taken from", () => {
    const selected = { bento: [[1, false]] };
    const trimmed = getTrimmedSelectedOptions(
      { bento: [1] },
      cartItems,
      selected,
    );
    assert.deepStrictEqual(getPostOption(trimmed, cartItems).bento, [
      ["S(+100)", ""],
    ]);
    assert.strictEqual(
      prices2subtotal(getPrices(YEN, { bento: [1] }, cartItems, trimmed)).bento,
      1100,
    );
  });

  // 店舗がオプションの組を減らしたあとに、古いカートが残っていることがある。
  it("drops a selection for an option group the shop has removed", () => {
    const fewerGroups = {
      bento: menuFixture({ price: 1000, itemOptionCheckbox: ["のり(+50)"] }),
    };
    const trimmed = getTrimmedSelectedOptions({ bento: [1] }, fewerGroups, {
      bento: [[3, true]],
    });
    assert.strictEqual(trimmed.bento[0].length, 1);
    assert.strictEqual(
      prices2subtotal(getPrices(YEN, { bento: [1] }, fewerGroups, trimmed))
        .bento,
      1050,
    );
  });
});
