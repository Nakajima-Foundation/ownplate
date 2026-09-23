import { describe, it } from "node:test";
import assert from "node:assert";

import { buildOrderDocDefinition } from "../../src/lib/pdf/orderDocDefinition.ts";
import { restaurantInfoFixture } from "../fixtures/restaurantInfo.ts";
import { orderInfoFixture } from "../fixtures/orderInfo.ts";
import { menuFixture } from "../fixtures/menu.ts";
import type {
  OrderInfoData,
  OrderItemData,
} from "../../src/models/orderInfoData.ts";

// 旧実装（pdfmake を stub して node から読めるようにしたもの）と並走させ、
// 登録番号の有無と形・内外税・税率・税区分の有無・受渡方法・決済・心づけ・送料・割引・
// 受付済みかどうか・オプションの有無を振って docDefinition を丸ごと比べ、全件一致した。
// harness は旧コードを含むので残せない。見つかった性質だけを残す。

const PHONE = "03-1234-5678";
const order = orderInfoFixture;

const items: OrderItemData[] = [
  {
    item: menuFixture({ itemName: "から揚げ弁当", tax: "food", price: 500 }),
    options: [],
    count: 2,
    id: "bento",
    orderIndex: ["bento", "0"],
  },
  {
    item: menuFixture({ itemName: "ビール", tax: "alcohol", price: 400 }),
    options: [],
    count: 1,
    id: "beer",
    orderIndex: ["beer", "0"],
  },
];

// 中身の文字列だけを平らに集める。pdfmake の入れ子は体裁の話で、ここで見たいのは
// 「何が書いてあるか」。
const texts = (doc: { content: unknown[] }): string => {
  const walk = (node: unknown): string => {
    if (typeof node === "string") return node;
    if (Array.isArray(node)) return node.map(walk).join(" ");
    if (node && typeof node === "object" && "text" in node)
      return walk(node.text);
    return "";
  };
  return doc.content.map(walk).join("\n");
};

const build = (
  restaurantExtra: Parameters<typeof restaurantInfoFixture>[0] = {},
  orderExtra: Partial<OrderInfoData> = {},
) =>
  texts(
    buildOrderDocDefinition(
      restaurantInfoFixture(restaurantExtra),
      order(orderExtra),
      items,
      PHONE,
    ),
  );

describe("buildOrderDocDefinition — 登録番号", () => {
  it("prints the number when the restaurant has one", () => {
    assert.ok(
      build({ invoiceNumber: "T1234567890123" }).includes("T1234567890123"),
    );
  });

  // 画面の検証はブラウザにしかない。Firestore を直接書けば不正な値が入る。
  it("prints nothing when the number is unset or malformed", () => {
    [undefined, "", "T123", "t1234567890123"].forEach((invoiceNumber) => {
      assert.ok(!build({ invoiceNumber }).includes("登録番号"));
    });
  });

  // 発行元は店舗。プラットフォームの行を挟むと、おもちかえり.com の番号に読める。
  it("puts the number above the platform line", () => {
    const printed = build({ invoiceNumber: "T1234567890123" });
    assert.ok(
      printed.indexOf("登録番号") < printed.indexOf("おもちかえり.com"),
    );
  });
});

describe("buildOrderDocDefinition — 税", () => {
  it("splits the tax by rate, using the restaurant's own rates", () => {
    const printed = build({ foodTax: 8, alcoholTax: 10 });
    assert.ok(printed.includes("8%対象"));
    assert.ok(printed.includes("10%対象"));
  });

  it("follows a change of the restaurant's rate", () => {
    assert.ok(build({ foodTax: 1 }).includes("1%対象"));
  });

  // 区分が出せない古い注文で何も出さないと、請求書から消費税の記載そのものが消える。
  it("falls back to a single tax line for an order with no breakdown", () => {
    const printed = build({}, { accounting: undefined, tax: 119 });
    assert.ok(printed.includes("内税額: ¥119"));
    assert.ok(!printed.includes("%対象"));
  });

  // 区分も税額も無い注文。行そのものは残す（消すと消費税の記載が請求書から消える）。
  it("writes a zero tax line rather than dropping it entirely", () => {
    const printed = build({}, { accounting: undefined, tax: undefined });
    assert.ok(printed.includes("内税額: ¥0"));
  });

  // 金額は注文時の設定で計算されて凍結されている。店舗の現在値を見ると、
  // 後から切り替えたときに金額と食い違う札を貼ることになる。
  it("takes the tax mode from the order, not the restaurant's current setting", () => {
    assert.ok(
      build({ inclusiveTax: true }, { inclusiveTax: false }).includes("外税額"),
    );
    assert.ok(
      build({ inclusiveTax: false }, { inclusiveTax: true }).includes("内税額"),
    );
  });
});

describe("buildOrderDocDefinition — 日付", () => {
  it("uses the confirmed handover time when the order was accepted", () => {
    assert.ok(build().includes("受渡時間: "));
  });

  // timeEstimated は受付時にしか書かれない。受付前にキャンセルされた注文でも印刷でき、
  // 日付の無い書類は適格簡易請求書として成立しない。
  it("falls back to the requested handover time when never accepted", () => {
    const printed = build({}, { timeEstimated: undefined });
    assert.ok(printed.includes("受渡希望時間: "));
    assert.ok(printed.includes("2026/09/22"));
  });
});

describe("buildOrderDocDefinition — 区分の外にある金額", () => {
  it("adds no line for an order carrying neither", () => {
    const printed = build();
    assert.ok(!printed.includes("送料"));
    assert.ok(!printed.includes("割引"));
  });

  it("writes the shipping cost and the discount when present", () => {
    const printed = build({}, { shippingCost: 200, discountPrice: 150 });
    assert.ok(printed.includes("送料: "));
    assert.ok(printed.includes("割引: -"));
  });
});

describe("buildOrderDocDefinition — 明細と体裁", () => {
  it("marks only the reduced-rate item", () => {
    const printed = build();
    assert.ok(printed.includes("から揚げ弁当 ※ "));
    assert.ok(printed.includes("ビール"));
    assert.ok(printed.includes("※軽減税率対象"));
  });

  it("carries the customer, the handover method and the total", () => {
    const printed = build();
    assert.ok(printed.includes("山田様"));
    assert.ok(printed.includes("テイクアウト"));
    assert.ok(printed.includes("合計: "));
  });

  it("says デリバリー for a delivery order", () => {
    assert.ok(build({}, { isDelivery: true }).includes("デリバリー"));
  });

  it("says カード決済 when the order was paid by card", () => {
    assert.ok(
      build({}, { payment: { stripe: "pi_123" } }).includes("カード決済"),
    );
    assert.ok(build().includes("現地払い"));
  });

  // 電話番号は呼び出し側から渡す。整形が vue の composable なので、ここで呼ぶと
  // このファイルが vue と firebase に依存し、node から読めなくなる。
  it("uses the phone number it is handed", () => {
    assert.ok(build().includes(PHONE));
  });

  it("carries the page settings pdfmake needs", () => {
    const doc = buildOrderDocDefinition(
      restaurantInfoFixture(),
      order(),
      items,
      PHONE,
    );
    assert.ok(doc.pageSize.width > 0);
    assert.strictEqual(doc.defaultStyle.font, "NotoSans");
  });
});

// 明細1行の金額。品物の値段に選んだオプションの差額を足したもの。ここがずれると
// レシートに出る単価と、客が実際に請求される額が食い違う。
describe("buildOrderDocDefinition — 明細1行", () => {
  const lineOf = (
    price: number | undefined,
    options: string[],
    count: number,
  ) =>
    texts(
      buildOrderDocDefinition(
        restaurantInfoFixture(),
        order(),
        [
          {
            item: menuFixture({ itemName: "弁当", tax: "food", price }),
            options,
            count,
            id: "bento",
            orderIndex: ["bento", "0"],
          },
        ],
        PHONE,
      ),
    );

  it("adds the chosen option's difference to the item's price", () => {
    assert.ok(lineOf(500, ["L(+300)"], 2).includes("@800  x 2"));
  });

  it("prints the item's own price when nothing was chosen", () => {
    assert.ok(lineOf(500, [], 1).includes("@500  x 1"));
  });

  it("treats an item with no price as free rather than printing nothing", () => {
    assert.ok(lineOf(undefined, ["L(+300)"], 1).includes("@300  x 1"));
  });

  it("names the chosen options, and writes no option line without them", () => {
    assert.ok(lineOf(500, ["L(+300)", "のり(+50)"], 1).includes("(opt: "));
    assert.ok(lineOf(500, ["L(+300)"], 1).includes("L(+300)"));
    assert.ok(!lineOf(500, [], 1).includes("opt: "));
  });
});

// 明細の外に出る金額。心づけと配送料は、それぞれ注文が持っているときだけ行になる。
describe("buildOrderDocDefinition — 心づけと配送料", () => {
  it("writes the tip the customer left", () => {
    assert.ok(build({}, { tip: 100 }).includes("心づけ(税込): ¥100"));
  });

  it("writes no tip line for an order without one", () => {
    assert.ok(!build({}, { tip: 0 }).includes("心づけ"));
    assert.ok(!build().includes("心づけ"));
  });

  it("writes the delivery fee for a delivery order", () => {
    assert.ok(
      build({}, { isDelivery: true, deliveryFee: 300 }).includes(
        "配送料(税込): ¥300",
      ),
    );
  });

  // 配送なのに送料が入っていない注文は、行を落とすのではなく0円と書く。
  it("writes zero rather than nothing when a delivery carries no fee", () => {
    assert.ok(
      build({}, { isDelivery: true, deliveryFee: undefined }).includes(
        "配送料(税込): ¥0",
      ),
    );
  });

  it("writes no delivery line for a pickup order", () => {
    assert.ok(!build({}, { deliveryFee: 300 }).includes("配送料"));
  });
});
