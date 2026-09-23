import { describe, it } from "node:test";
import assert from "node:assert";
import { data2csv } from "../../src/utils/csv.ts";
import {
  reportHeaders,
  reportHeadersWithAddress,
} from "../../src/utils/reportUtils.ts";

// 注文の書き出し。店主が Excel で開いて売上を数える。
const asKey = (key: string) => key;

const rows = [
  { name: "#001", count: 2, total: 1000, memo: "" },
  { name: "#002", count: 1, total: 500, memo: "" },
];
const fields = ["name", "count", "total", "memo"];

const linesOf = (csv: string) => csv.split("\n");

describe("data2csv", () => {
  // 先頭の BOM が無いと、Excel が UTF-8 と認識せず日本語が化ける。
  it("starts with the byte order mark Excel needs to read UTF-8", () => {
    const csv = data2csv({ data: rows, fields }, asKey);
    assert.strictEqual(csv[0], "﻿");
  });

  it("writes the field names as the first line", () => {
    const csv = data2csv({ data: rows, fields }, asKey);
    assert.strictEqual(linesOf(csv)[0], "﻿name,count,total,memo");
  });

  // 見出しは翻訳済みの名前で差し替えられる。列の並びは fields のまま。
  it("prefers the display names when the caller supplies them", () => {
    const csv = data2csv(
      { data: rows, fields, fieldNames: ["注文", "個数", "合計", "備考"] },
      asKey,
    );
    assert.strictEqual(linesOf(csv)[0], "﻿注文,個数,合計,備考");
  });

  it("writes one line per order, in the order of the fields", () => {
    const csv = data2csv({ data: rows, fields }, asKey);
    assert.deepStrictEqual(linesOf(csv).slice(1), [
      "#001,2,1000,",
      "#002,1,500,",
    ]);
  });

  // 区切り記号が値の中にあると列がずれる。囲むのではなく空白に置き換えている。
  it("replaces the separators inside a value with a space, keeping the columns aligned", () => {
    const csv = data2csv(
      {
        data: [{ name: "山田, 太郎", count: 1, total: 1, memo: "改行\nあり" }],
        fields,
      },
      asKey,
    );
    const body = linesOf(csv)[1];
    assert.strictEqual(body, "山田  太郎,1,1,改行 あり");
    assert.strictEqual(body.split(",").length, fields.length);
  });

  it("replaces a tab and a carriage return as well", () => {
    const csv = data2csv(
      { data: [{ name: "a\tb\rc", count: 1, total: 1, memo: "" }], fields },
      asKey,
    );
    assert.strictEqual(linesOf(csv)[1], "a b c,1,1,");
  });

  // 数値を文字列に寄せると、Excel の側で合計が取れなくなる。
  it("leaves numbers, booleans and blanks as they are", () => {
    const csv = data2csv(
      {
        data: [{ name: "x", count: 0, total: false, memo: null }],
        fields,
      },
      asKey,
    );
    assert.strictEqual(linesOf(csv)[1], "x,0,false,");
  });

  it("writes only the header when there are no orders", () => {
    const csv = data2csv({ data: [], fields }, asKey);
    assert.deepStrictEqual(linesOf(csv), ["﻿name,count,total,memo", ""]);
  });
});

// 合計行。Excel の式として書き出すので、範囲が1行でもずれると合計が狂う。
describe("data2csv の合計行", () => {
  const formulas = { count: "sum", total: "sum" };

  it("adds no total line when the caller asked for no formulas", () => {
    const csv = data2csv({ data: rows, fields }, asKey);
    assert.strictEqual(linesOf(csv).length, 3);
  });

  it("spans the formula from the first order row to the last", () => {
    const csv = data2csv({ data: rows, fields, formulas }, asKey);
    const footer = linesOf(csv).at(-1);
    assert.strictEqual(footer, "order.total,=sum(B2:B3),=sum(C2:C3),");
  });

  it("grows the range with the number of orders", () => {
    const many = Array.from({ length: 10 }, (_, index) => ({
      name: `#${index}`,
      count: 1,
      total: 1,
      memo: "",
    }));
    const footer = linesOf(
      data2csv({ data: many, fields, formulas }, asKey),
    ).at(-1);
    assert.strictEqual(footer, "order.total,=sum(B2:B11),=sum(C2:C11),");
  });

  it("labels the total line through the caller's translator", () => {
    const footer = linesOf(
      data2csv({ data: rows, fields, formulas }, asKey),
    ).at(-1);
    assert.strictEqual(footer?.split(",")[0], "order.total");
  });

  it("leaves a column without a formula empty", () => {
    const footer = linesOf(
      data2csv({ data: rows, fields, formulas: { total: "sum" } }, asKey),
    ).at(-1);
    assert.strictEqual(footer, "order.total,,=sum(C2:C3),");
  });
});

// 列記号は A-Z しか作れない（実装の注記のとおり）。27列目以降に式を付けると、
// AA ではなく [ を指す壊れた式になる。いまの見出しでは式の付く列が内側に収まっている。
describe("合計行の列記号が A-Z に収まっていること", () => {
  const withFormula = ["count", "total"];

  [
    ["reportHeaders", reportHeaders],
    ["reportHeadersWithAddress", reportHeadersWithAddress],
  ].forEach(([name, headers]) => {
    it(`keeps every formula column of ${name} inside A-Z`, () => {
      withFormula.forEach((field) => {
        const index = headers.indexOf(field);
        assert.notStrictEqual(index, -1, `${field} が ${name} に無い`);
        assert.ok(
          index < 26,
          `${field} は ${index} 列目。26 以上だと列記号が AA ではなく [ になる`,
        );
      });
    });
  });

  // 上の検査が空振りしないこと。26列目以降に式を付けると本当に壊れる。
  it("really does break once a formula sits past the twenty-sixth column", () => {
    const wide = Array.from({ length: 27 }, (_, index) => `f${index}`);
    const footer = data2csv(
      {
        data: [Object.fromEntries(wide.map((field) => [field, 1]))],
        fields: wide,
        formulas: { f26: "sum" },
      },
      asKey,
    )
      .split("\n")
      .at(-1);
    assert.ok(
      footer?.includes("=sum([2:[2)"),
      `列記号が壊れていない: ${footer}`,
    );
  });
});
