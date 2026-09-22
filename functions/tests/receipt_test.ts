import { describe, it } from "node:test";
import assert from "node:assert";

import { buildReceiptText, hasReducedTaxItem, itemMark, reducedTaxNote, taxLines } from "../src/functions/express/receiptFormat";
import { taxDisplayRows } from "../src/utils/commonUtils";

const food = { revenue: 1000, tax: 74 };
const alcohol = { revenue: 500, tax: 45 };

describe("taxLines", () => {
  const rows = (accounting: unknown, totalTax = 119) => taxDisplayRows(accounting as never, 8, 10, totalTax);

  it("writes one pair of lines per category", () => {
    assert.strictEqual(taxLines(rows({ food, alcohol }), "内税"), "8%対象 | ¥1000\n消費税（内税） | ¥74\n10%対象 | ¥500\n消費税（内税） | ¥45");
  });

  // 区分が出せない注文で何も出さないと、消費税の記載そのものが消える
  it("falls back to the single total for an order with no breakdown", () => {
    assert.strictEqual(taxLines(rows(undefined), "外税"), "消費税（外税） | ¥119");
  });

  it("carries the inclusive/exclusive wording through", () => {
    assert.ok(taxLines(rows({ food }), "外税").includes("消費税（外税）"));
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

// buildReceiptText の切り出しは「移しただけ」を主張している。旧実装と並走させて
// 400 通り（税区分・accounting の有無・内外税・受渡方法・決済・オプション）を比べ、
// 税率別の行・消費税の行・※・凡例を除いた全行が一致することを確認した。
// harness は旧コードを含むので残せない。そこで見つかった性質だけを残す。
describe("buildReceiptText — 旧実装との差が意図した箇所だけであること", () => {
  // 差分テストで見つかった。凡例が無いときに行だけ残すと、紙のレシートに
  // 旧実装には無かった空行が1行増える。
  it("adds no blank line when there is no note to print", () => {
    const withNote = buildReceiptText(dummyRestaurant(), dummyOrder());
    const withoutNote = buildReceiptText(
      dummyRestaurant(),
      dummyOrder({
        order: { beer: { 0: 1 } },
        menuItems: { beer: { itemName: "ビール", tax: "alcohol" } },
        accounting: { alcohol: { revenue: 500, tax: 45 } },
      }),
    );
    assert.ok(withNote.includes('支払方法："現地払い"|\n※軽減税率対象'));
    assert.ok(withoutNote.includes('支払方法："現地払い"|\n\n'));
    assert.ok(!withoutNote.includes('支払方法："現地払い"|\n\n\n\n'));
  });
});

describe("buildReceiptText — 登録番号", () => {
  it("prints the registration number when the restaurant has one", () => {
    const text = buildReceiptText(dummyRestaurant({ invoiceNumber: "T1234567890123" }), dummyOrder());
    assert.ok(text.includes("登録番号：T1234567890123"));
  });

  // 免税事業者は番号を持たない。**行ごと**出さないことを、空行が増えていないことで
  // 確かめる。!includes("登録番号") だけだと、空行が残っていても緑のまま通る。
  it("leaves the line out entirely when unset, adding no blank line", () => {
    [undefined, ""].forEach((invoiceNumber) => {
      const text = buildReceiptText(dummyRestaurant({ invoiceNumber }), dummyOrder());
      assert.ok(!text.includes("登録番号"));
      assert.ok(text.includes('おもちかえり.com\n\n^^^"'));
    });
  });

  // 画面側の検証はブラウザにしか無い。Firestore を直接書けば不正な値が入るので、
  // 印字の手前でも見る。不正な番号のレシートは、受け取った側が控除に使えない。
  it("prints nothing when the stored number is malformed", () => {
    ["T123", "1234567890123", "t1234567890123", " T1234567890123"].forEach((invoiceNumber) => {
      const text = buildReceiptText(dummyRestaurant({ invoiceNumber }), dummyOrder());
      assert.ok(!text.includes("登録番号"));
    });
  });

  // 印字される番号は T + 半角数字13桁だけなので、receiptline の記法は入りようがない。
  // 「記法を含む番号が素通りしない」を assert しても、先に形で弾かれるため何も
  // 検証できない（実際に escape を外しても緑のままだった）。代わりに、印字された
  // 行が期待どおりであることと、記法を含む値では行が出ないことを分けて見る。
  it("prints the number verbatim when it is well formed", () => {
    const text = buildReceiptText(dummyRestaurant({ invoiceNumber: "T9876543210987" }), dummyOrder());
    assert.ok(text.includes("登録番号：T9876543210987"));
  });

  // 登録番号と税率ごとの区分は両方そろって初めて適格簡易請求書になる。
  // 片方だけだと、受け取った側が仕入税額控除に使えない。
  it("prints the number alongside the per-rate breakdown, not instead of it", () => {
    const text = buildReceiptText(dummyRestaurant({ invoiceNumber: "T1234567890123" }), dummyOrder());
    assert.ok(text.includes("登録番号：T1234567890123"));
    assert.ok(text.includes("8%対象 | ¥1000"));
    assert.ok(text.includes("10%対象 | ¥500"));
  });
});
