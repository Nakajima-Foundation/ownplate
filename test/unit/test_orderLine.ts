import { describe, it } from "node:test";
import assert from "node:assert";

import {
  orderLineOptionsText,
  orderLineTotalPrice,
} from "../../src/utils/orderLine.ts";

// 注文画面・注文履歴の明細 1 行（OrderItem.vue）に出るオプションと金額。
// 金額を間違えても画面は落ちずにそれらしい数字を出すので、ここで押さえる。
//
// OrderItem.vue からの呼び出し自体はここでは試験していない（部品を組み立てる仕組みが無い）。
// 呼び出しを外しても、このファイルは赤くならない。

const yen = (price: number) => `¥${price}`;

// 型が認めない壊れたデータ。Firestore からはこういう値も来うる。
const brokenOptions: string[] = JSON.parse("null");

describe("orderLineOptionsText", () => {
  it("lists each chosen option with its price localized", () => {
    assert.strictEqual(
      orderLineOptionsText(["L(+300)", "辛口"], yen),
      "L(+¥300), 辛口",
    );
  });

  it("shows a discount without a plus sign", () => {
    assert.strictEqual(orderLineOptionsText(["S(-100)"], yen), "S(¥-100)");
  });

  it("reads full-width signs the shop may have typed", () => {
    assert.strictEqual(
      orderLineOptionsText(["大(＋50)", "小(ー20)"], yen),
      "大(+¥50), 小(¥-20)",
    );
  });

  // 選ばなかったオプション欄は空文字で入っている。区切りの「, 」だけが並ばないこと。
  it("skips the options that were left empty, keeping the order of the rest", () => {
    assert.strictEqual(
      orderLineOptionsText(["", "L(+300)", "", "辛口", ""], yen),
      "L(+¥300), 辛口",
    );
  });

  it("is empty when nothing was chosen", () => {
    assert.strictEqual(orderLineOptionsText([], yen), "");
    assert.strictEqual(orderLineOptionsText(["", ""], yen), "");
    assert.strictEqual(orderLineOptionsText("", yen), "");
  });

  // 以前は配列でないと .filter で落ちていた。
  it("treats a single string as one option", () => {
    assert.strictEqual(orderLineOptionsText("L(+300)", yen), "L(+¥300)");
  });

  it("shows nothing for missing options instead of throwing", () => {
    assert.strictEqual(orderLineOptionsText(brokenOptions, yen), "");
  });

  it("uses the localizer it is given, not a fixed format", () => {
    const calls: number[] = [];
    orderLineOptionsText(["L(+300)", "S(-100)", "辛口"], (price) => {
      calls.push(price);
      return "";
    });
    assert.deepStrictEqual(calls, [300, -100]);
  });
});

describe("orderLineTotalPrice", () => {
  it("is the unit price times the count when there are no options", () => {
    assert.strictEqual(orderLineTotalPrice(500, [], 3), 1500);
  });

  it("adds the option prices to the unit price", () => {
    assert.strictEqual(
      orderLineTotalPrice(500, ["L(+300)", "S(-100)"], 1),
      700,
    );
  });

  // (500 + 300) × 2。単価だけ掛けてからオプションを 1 回足すと 1300 になる。
  it("charges the options once per item, not once per line", () => {
    assert.strictEqual(orderLineTotalPrice(500, ["L(+300)"], 2), 1600);
  });

  it("ignores options that carry no price", () => {
    assert.strictEqual(
      orderLineTotalPrice(500, ["辛口", "", "(なし)"], 2),
      1000,
    );
  });

  it("reads full-width signs", () => {
    assert.strictEqual(
      orderLineTotalPrice(500, ["大(＋50)", "小(ー20)"], 1),
      530,
    );
  });

  // 日本円は 1 円単位。オプションごとに丸めてから足すので、端数は合算されない。
  // 合算してから丸めると 0.4 + 0.4 = 0.8 → 1 円になる。
  it("rounds each option price to the yen before adding them", () => {
    assert.strictEqual(
      orderLineTotalPrice(500, ["a(+0.4)", "b(+0.4)"], 1),
      500,
    );
    assert.strictEqual(orderLineTotalPrice(500, ["a(+50.5)"], 1), 551);
  });

  it("is zero for a line of zero items", () => {
    assert.strictEqual(orderLineTotalPrice(500, ["L(+300)"], 0), 0);
  });

  it("can go below the unit price with a discount option", () => {
    assert.strictEqual(orderLineTotalPrice(500, ["S(-600)"], 1), -100);
  });

  it("treats a single string as one option", () => {
    assert.strictEqual(orderLineTotalPrice(500, "L(+300)", 2), 1600);
  });

  it("charges only the unit price for missing options instead of throwing", () => {
    assert.strictEqual(orderLineTotalPrice(500, brokenOptions, 2), 1000);
  });

  // 数が n 個なら 1 個分の n 倍。オプションの形と単価をいろいろ変えて確かめる。
  it("is always the one-item price times the count", () => {
    const optionSets: string[][] = [
      [],
      [""],
      ["L(+300)"],
      ["S(-100)", "辛口"],
      ["大(＋50.5)", "x(ー20)", "(+0)"],
    ];
    const unitPrices = [0, 1, 500, 999];
    const counts = [0, 1, 2, 7, 100];
    optionSets.forEach((options) =>
      unitPrices.forEach((unitPrice) =>
        counts.forEach((count) =>
          assert.strictEqual(
            orderLineTotalPrice(unitPrice, options, count),
            orderLineTotalPrice(unitPrice, options, 1) * count,
            JSON.stringify({ unitPrice, options, count }),
          ),
        ),
      ),
    );
  });

  // 空のオプション欄はいくつ足しても金額を変えない。
  it("is not changed by empty option slots", () => {
    const withoutEmpty = orderLineTotalPrice(500, ["L(+300)"], 2);
    [1, 2, 5].forEach((emptySlots) => {
      const options = [
        "L(+300)",
        ...Array.from({ length: emptySlots }, () => ""),
      ];
      assert.strictEqual(orderLineTotalPrice(500, options, 2), withoutEmpty);
    });
  });
});
