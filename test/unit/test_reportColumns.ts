import { describe, it } from "node:test";
import assert from "node:assert";

import {
  downloadFields,
  reportHeaders,
  reportHeadersWithAddress,
  revenueCSVHeader,
  revenueTableHeader,
} from "../../src/utils/reportUtils.ts";
import ja from "../../src/lang/ja.ts";
import en from "../../src/lang/en.ts";

// 売上表と注文の書き出しの列。列を足したのに見出しの文言を足し忘れると、画面に
// 翻訳前の鍵がそのまま出る（`order.discount` のような文字列が見出しになる）。
//
// 確かめるのは設定されている言語と、その差し戻し先。他の言語は訳が揃っておらず、
// 差し戻しで英語が出るのが意図された動き。
const labelsOf = (messages: { order?: { [key: string]: unknown } }) =>
  messages.order ?? {};

describe("売上表の列", () => {
  it("has a heading in Japanese for every column", () => {
    const missing = revenueTableHeader.filter(
      (field) => labelsOf(ja)[field] === undefined,
    );
    assert.deepStrictEqual(missing, []);
  });

  it("has one in English too, which every other language falls back to", () => {
    const missing = revenueTableHeader.filter(
      (field) => labelsOf(en)[field] === undefined,
    );
    assert.deepStrictEqual(missing, []);
  });

  it("names each column once", () => {
    assert.strictEqual(
      new Set(revenueTableHeader).size,
      revenueTableHeader.length,
    );
  });
});

describe("書き出す列", () => {
  const noDuplicates = (fields: string[]) =>
    assert.strictEqual(new Set(fields).size, fields.length);

  it("names each column once in every list", () => {
    noDuplicates(revenueCSVHeader);
    noDuplicates(downloadFields);
    noDuplicates(reportHeaders);
    noDuplicates(reportHeadersWithAddress);
  });

  // 送り先つきの書き出しは、通常の書き出しに送り先の欄を足したもの。片方にだけ列を
  // 足すと、注文の種類によって列がずれた表が出る。
  it("keeps every ordinary column in the version that carries the address", () => {
    const dropped = reportHeaders.filter(
      (field) => !reportHeadersWithAddress.includes(field),
    );
    assert.deepStrictEqual(dropped, []);
  });

  it("adds the address fields on top of them", () => {
    const added = reportHeadersWithAddress.filter(
      (field) => !reportHeaders.includes(field),
    );
    assert.ok(
      added.every(
        (field) => field.startsWith("ec.") || field === "shippingCost",
      ),
    );
    assert.ok(added.includes("ec.zip"));
    assert.ok(added.includes("ec.address"));
  });
});
