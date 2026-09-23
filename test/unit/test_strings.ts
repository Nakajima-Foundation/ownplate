import { describe, it } from "node:test";
import assert from "node:assert";
import {
  formatOption,
  halfCharactors,
  nameOfOrder,
} from "../../src/utils/strings.ts";
import { orderInfoFixture } from "../fixtures/orderInfo.ts";

// 注文番号は伝票・レシート・請求書・通知のすべてに出る。桁が揺れると、店主が
// 「#7」と「#007」を別の注文だと思う。
describe("nameOfOrder", () => {
  const numbered = (number: string) => orderInfoFixture({ number });

  it("pads the number to three digits", () => {
    assert.strictEqual(nameOfOrder(numbered("7")), "#007");
    assert.strictEqual(nameOfOrder(numbered("42")), "#042");
    assert.strictEqual(nameOfOrder(numbered("123")), "#123");
  });

  // 3桁を超えると上の桁から落ちる。番号は店舗ごとに日次で振り直されるので、いまは届かない。
  it("keeps only the last three digits once the number outgrows them", () => {
    assert.strictEqual(nameOfOrder(numbered("1234")), "#234");
  });

  it("names a zeroth order rather than falling back to nothing", () => {
    assert.strictEqual(nameOfOrder(numbered("0")), "#000");
  });

  it("names nothing when the order has no number yet", () => {
    assert.strictEqual(
      nameOfOrder(orderInfoFixture({ number: undefined })),
      "",
    );
  });
});

// オプションの金額は店舗オーナーが商品名に直接打ち込む。通貨の表示は呼び出し側が決めるので、
// この関数がするのは「金額部分を見つけて、符号を付けて差し替える」だけ。
describe("formatOption", () => {
  const asIs = (price: number) => String(price);

  it("replaces the price inside the choice's name", () => {
    assert.strictEqual(formatOption("L(+300)", asIs), "L(+300)");
    assert.strictEqual(formatOption("S(-50)", asIs), "S(-50)");
  });

  // 店舗オーナーは全角で打つ。半角として読まないと、金額の付いていない選択肢に見える。
  it("reads the full-width signs the owner types", () => {
    assert.strictEqual(formatOption("大(＋1000)", asIs), "大(+1000)");
    assert.strictEqual(formatOption("小(ー200)", asIs), "小(-200)");
    assert.strictEqual(formatOption("小(−200)", asIs), "小(-200)");
  });

  // 引く側に + を足すと、値引きが値上げに見える。
  it("marks a rise with a plus and leaves a fall with its minus", () => {
    assert.strictEqual(formatOption("のり(+50)", asIs), "のり(+50)");
    assert.strictEqual(formatOption("割引(-100)", asIs), "割引(-100)");
    assert.strictEqual(formatOption("ゼロ(+0)", asIs), "ゼロ(0)");
  });

  it("hands the price to the caller's formatter, not to its own", () => {
    assert.strictEqual(
      formatOption("L(+1000)", (price) => price.toLocaleString("en-US")),
      "L(+1,000)",
    );
  });

  it("leaves a choice with no price in its name untouched", () => {
    assert.strictEqual(formatOption("のり", asIs), "のり");
    assert.strictEqual(formatOption("のり()", asIs), "のり()");
    assert.strictEqual(formatOption("のり(+abc)", asIs), "のり(+abc)");
  });

  it("reads a missing choice as an empty name", () => {
    assert.strictEqual(formatOption(null, asIs), "");
    assert.strictEqual(formatOption(undefined, asIs), "");
    assert.strictEqual(formatOption("", asIs), "");
  });
});

// 保存の手前で全角を半角に寄せる。寄せ漏れると、同じ商品名が2通りで保存される。
describe("halfCharactors", () => {
  it("narrows the full-width letters, digits and brackets the owner typed", () => {
    assert.strictEqual(halfCharactors("ＡＢＣ"), "ABC");
    assert.strictEqual(halfCharactors("ａｂｃ"), "abc");
    assert.strictEqual(halfCharactors("１２３"), "123");
    assert.strictEqual(halfCharactors("（＋）"), "(＋)");
  });

  it("leaves Japanese text alone", () => {
    assert.strictEqual(halfCharactors("からあげ"), "からあげ");
    assert.strictEqual(halfCharactors("唐揚げ（Ｌ）"), "唐揚げ(L)");
  });

  it("returns an empty string unchanged", () => {
    assert.strictEqual(halfCharactors(""), "");
  });
});
