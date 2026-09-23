import { describe, it } from "node:test";
import assert from "node:assert";
import { sortRestaurantObj } from "../../src/utils/RestaurantUtils.ts";
import { convMm2pt } from "../../src/lib/pdf/pdfStyles.ts";
import { restaurantInfoFixture } from "../fixtures/restaurantInfo.ts";

// restaurant2AreaObj はここでは試験していない。実際に使うのは doc.id と doc.data() だけなのに、
// 引数の型が QueryDocumentSnapshot（metadata / exists / get / toJSON / ref を含む）なので、
// as を使わずに満たす値が作れない。引数の型を { id: string; data(): ... } まで狭めれば
// 試験できるようになるが、それは実装の変更なので別の作業にする。

// 県ごとの並びを店名順にする。
describe("sortRestaurantObj", () => {
  // 並べ替えた配列ではなく undefined を返す。呼び出し側は引数のほうを読む。
  // 返り値を使う書き方に直すと、静かに undefined を渡すことになる。
  it("sorts the lists in place and returns nothing", () => {
    const grouped = {
      東京都: [
        restaurantInfoFixture({ restaurantName: "う店" }),
        restaurantInfoFixture({ restaurantName: "あ店" }),
        restaurantInfoFixture({ restaurantName: "い店" }),
      ],
    };
    const returned = sortRestaurantObj(grouped);
    assert.strictEqual(returned, undefined);
    assert.deepStrictEqual(
      grouped["東京都"].map((shop) => shop.restaurantName),
      ["あ店", "い店", "う店"],
    );
  });

  it("sorts every state, not just the first", () => {
    const grouped = {
      東京都: [
        restaurantInfoFixture({ restaurantName: "い店" }),
        restaurantInfoFixture({ restaurantName: "あ店" }),
      ],
      大阪府: [
        restaurantInfoFixture({ restaurantName: "え店" }),
        restaurantInfoFixture({ restaurantName: "う店" }),
      ],
    };
    sortRestaurantObj(grouped);
    assert.deepStrictEqual(
      grouped["東京都"].map((s) => s.restaurantName),
      ["あ店", "い店"],
    );
    assert.deepStrictEqual(
      grouped["大阪府"].map((s) => s.restaurantName),
      ["う店", "え店"],
    );
  });

  it("tolerates a state with one shop, and one with none", () => {
    const grouped = {
      東京都: [restaurantInfoFixture({ restaurantName: "あ店" })],
      大阪府: [],
    };
    assert.doesNotThrow(() => sortRestaurantObj(grouped));
    assert.strictEqual(grouped["東京都"].length, 1);
  });
});

// レシートの幅はミリで決めてあるが、pdfmake はポイントで受け取る。
// 期待値は実装の式を書き写さず、実際の数で書く。同じ式で期待値を出すと、係数を変えても
// 試験が緑のまま通ってしまう（一度そうなった）。
describe("convMm2pt", () => {
  // 1インチ = 25.4mm = 72pt は定義。ここが合っていれば係数は正しい。
  it("converts one inch to seventy-two points", () => {
    assert.strictEqual(convMm2pt(25.4), 72);
  });

  it("converts the receipt widths the printers use", () => {
    assert.strictEqual(convMm2pt(54), 153.07);
    assert.strictEqual(convMm2pt(58), 164.41);
    assert.strictEqual(convMm2pt(80), 226.77);
  });

  it("keeps two decimal places, no more", () => {
    assert.strictEqual(convMm2pt(1), 2.83);
    assert.strictEqual(convMm2pt(0.5), 1.42);
  });

  it("converts nothing to nothing", () => {
    assert.strictEqual(convMm2pt(0), 0);
  });

  it("grows with the width", () => {
    assert.ok(convMm2pt(80) > convMm2pt(58));
    assert.ok(convMm2pt(58) > convMm2pt(54));
  });
});
