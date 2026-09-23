import { describe, it } from "node:test";
import assert from "node:assert";

import { getOrderItems } from "../../src/utils/utils.ts";
import { orderInfoFixture } from "../fixtures/orderInfo.ts";
import { menuFixture } from "../fixtures/menu.ts";

// 注文画面・注文履歴・店舗の注文一覧が出す明細は、ここで組み立てられる。
// 一行でも落とすと、作られない商品・請求されない商品が出る。
//
// menuItems は注文した時点の商品の写し。menuObj はいまのメニュー。値段や商品名は
// 写しから取る（あとで値段を変えても、確定した注文の額は動かない）。
const ordered = menuFixture({ itemName: "から揚げ弁当", price: 500 });
const current = menuFixture({ itemName: "から揚げ弁当（新）", price: 800 });

describe("getOrderItems", () => {
  const itemsOf = (
    order: { [key: string]: number[] },
    options: { [key: string]: string[] },
    menuItems: { [key: string]: typeof ordered } = { bento: ordered },
    menuObj: { [key: string]: typeof current } = { bento: current },
  ) => getOrderItems(orderInfoFixture({ order, options, menuItems }), menuObj);

  it("makes one row per line of the order", () => {
    const rows = itemsOf({ bento: [2] }, { bento: ["L(+300)"] });
    assert.strictEqual(rows.length, 1);
    assert.strictEqual(rows[0].count, 2);
    assert.strictEqual(rows[0].id, "bento");
    assert.strictEqual(rows[0].options, "L(+300)");
  });

  // 同じ商品を違うオプションで頼める。行ごとに数もオプションも別。
  it("keeps each line of the same item apart", () => {
    const rows = itemsOf({ bento: [2, 1] }, { bento: ["L(+300)", "S(+100)"] });
    assert.strictEqual(rows.length, 2);
    assert.deepStrictEqual(
      rows.map((row) => row.count),
      [2, 1],
    );
    assert.deepStrictEqual(
      rows.map((row) => row.options),
      ["L(+300)", "S(+100)"],
    );
  });

  it("covers every item in the order, not just the first", () => {
    const rows = getOrderItems(
      orderInfoFixture({
        order: { bento: [1], beer: [3] },
        options: { bento: [""], beer: [""] },
        menuItems: {
          bento: ordered,
          beer: menuFixture({ itemName: "ビール" }),
        },
      }),
      {},
    );
    assert.deepStrictEqual(
      rows.map((row) => row.id),
      ["bento", "beer"],
    );
  });

  // 行を指す目印。編集や取り消しはこれで行を特定するので、番号が文字列であることまで含めて
  // 揃っていないと別の行に当たる。
  it("marks each row with the item and its position", () => {
    const rows = itemsOf({ bento: [1, 1] }, { bento: ["", ""] });
    assert.deepStrictEqual(rows[0].orderIndex, ["bento", "0"]);
    assert.deepStrictEqual(rows[1].orderIndex, ["bento", "1"]);
  });

  // 数が配列ではなく数値ひとつで入っている古い注文も読める。ただしその形は型が
  // 認めていないので、ここからは渡せない（SingularitySociety/omochikaeri-docs#209）。

  it("takes the name and the price from the order, not from the menu today", () => {
    const rows = itemsOf({ bento: [1] }, { bento: [""] });
    assert.strictEqual(rows[0].item.itemName, "から揚げ弁当");
    assert.strictEqual(rows[0].item.price, 500);
  });

  // 写しが無い古い注文は、いまのメニューで補う。
  it("falls back to today's menu when the order kept no copy", () => {
    const rows = itemsOf({ bento: [1] }, { bento: [""] }, { other: ordered });
    assert.strictEqual(rows[0].item.itemName, "から揚げ弁当（新）");
  });

  it("still makes the row when neither has the item", () => {
    const rows = itemsOf(
      { bento: [1] },
      { bento: [""] },
      { other: ordered },
      {},
    );
    assert.strictEqual(rows.length, 1);
    assert.strictEqual(rows[0].item.itemName, undefined);
    assert.strictEqual(rows[0].count, 1);
  });

  // 写真だけは逆で、いまのメニューから取る。店舗が写真を差し替えたら過去の注文にも反映される。
  it("takes the photo from today's menu even when the order kept a copy", () => {
    const rows = itemsOf(
      { bento: [1] },
      { bento: [""] },
      { bento: ordered },
      {
        bento: menuFixture({ itemPhoto: "https://example.com/new.jpg" }),
      },
    );
    assert.strictEqual(rows[0].item.itemPhoto, "https://example.com/new.jpg");
  });

  it("makes no rows for an order with nothing in it", () => {
    assert.deepStrictEqual(itemsOf({}, {}), []);
  });

  it("makes no rows for an order that kept no copy of the menu at all", () => {
    assert.deepStrictEqual(
      getOrderItems(
        orderInfoFixture({ order: { bento: [1] }, menuItems: undefined }),
        { bento: current },
      ),
      [],
    );
  });

  it("makes no rows when the order itself is missing", () => {
    assert.deepStrictEqual(
      getOrderItems(orderInfoFixture({ order: undefined }), { bento: current }),
      [],
    );
  });
});
