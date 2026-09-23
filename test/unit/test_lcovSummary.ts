import { describe, it } from "node:test";
import assert from "node:assert";
import {
  barOf,
  formatCell,
  parseLcov,
  percentOf,
  renderCoverageMarkdown,
  totalCoverage,
} from "../../scripts/lcovSummary.ts";

const record = (file: string, counts: string[]) =>
  ["TN:", `SF:${file}`, ...counts, "end_of_record"].join("\n");

const lcov = [
  record("/repo/src/a.ts", [
    "FNF:2",
    "FNH:1",
    "DA:1,1",
    "LF:10",
    "LH:9",
    "BRF:4",
    "BRH:4",
  ]),
  record("/repo/src/b.ts", [
    "FNF:0",
    "FNH:0",
    "LF:10",
    "LH:5",
    "BRF:0",
    "BRH:0",
  ]),
].join("\n");

describe("parseLcov", () => {
  it("reads the counts of every file record", () => {
    const files = parseLcov(lcov);
    assert.deepStrictEqual(files[0], {
      file: "/repo/src/a.ts",
      lines: { hit: 9, found: 10 },
      branches: { hit: 4, found: 4 },
      functions: { hit: 1, found: 2 },
    });
    assert.strictEqual(files.length, 2);
  });

  it("strips the root with or without a trailing slash", () => {
    assert.strictEqual(parseLcov(lcov, "/repo")[0].file, "src/a.ts");
    assert.strictEqual(parseLcov(lcov, "/repo/")[0].file, "src/a.ts");
  });

  it("keeps a path outside the root as it is", () => {
    assert.strictEqual(parseLcov(lcov, "/other")[0].file, "/repo/src/a.ts");
  });

  it("does not strip a root that is only a name prefix", () => {
    assert.strictEqual(
      parseLcov(record("/repo2/x.ts", []), "/repo")[0].file,
      "/repo2/x.ts",
    );
  });

  it("returns no files for empty or malformed input", () => {
    assert.deepStrictEqual(parseLcov(""), []);
    assert.deepStrictEqual(parseLcov("garbage\nend_of_record"), []);
  });

  it("treats missing or non-numeric counts as zero", () => {
    const [file] = parseLcov(record("x.ts", ["LF:abc"]));
    assert.deepStrictEqual(file.lines, { hit: 0, found: 0 });
  });

  it("keeps colons inside the file path", () => {
    assert.strictEqual(
      parseLcov(record("C:\\repo\\a.ts", []))[0].file,
      "C:\\repo\\a.ts",
    );
  });
});

describe("totalCoverage", () => {
  it("adds up every file", () => {
    assert.deepStrictEqual(totalCoverage(parseLcov(lcov)), {
      lines: { hit: 14, found: 20 },
      branches: { hit: 4, found: 4 },
      functions: { hit: 1, found: 2 },
    });
  });

  it("is zero for no files", () => {
    assert.deepStrictEqual(totalCoverage([]).lines, { hit: 0, found: 0 });
  });
});

describe("percentOf", () => {
  it("is undefined when nothing was found, rather than dividing by zero", () => {
    assert.strictEqual(percentOf({ hit: 0, found: 0 }), undefined);
  });

  it("is the hit ratio", () => {
    assert.strictEqual(percentOf({ hit: 1, found: 4 }), 25);
  });
});

describe("barOf", () => {
  it("always has ten cells", () => {
    [0, 4, 5, 50, 99, 100].forEach((percent) =>
      assert.strictEqual([...barOf(percent)].length, 10),
    );
  });

  it("is empty at 0% and full at 100%", () => {
    assert.strictEqual(barOf(0), "░░░░░░░░░░");
    assert.strictEqual(barOf(100), "██████████");
  });
});

describe("formatCell", () => {
  it("colours by the thresholds", () => {
    assert.match(formatCell({ hit: 90, found: 100 }), /^🟢 90\.00%/);
    assert.match(formatCell({ hit: 75, found: 100 }), /^🟡 75\.00%/);
    assert.match(formatCell({ hit: 74, found: 100 }), /^🔴 74\.00%/);
  });

  it("shows a dash when there is nothing to cover", () => {
    assert.strictEqual(formatCell({ hit: 0, found: 0 }), "—");
  });
});

describe("renderCoverageMarkdown", () => {
  const markdown = renderCoverageMarkdown("Frontend", parseLcov(lcov, "/repo"));

  it("opens with the title and the total row", () => {
    assert.ok(markdown.startsWith("## 🧪 Coverage: Frontend\n"));
    assert.match(markdown, /\| \*\*Total\*\* \| 🔴 70\.00% /);
  });

  it("lists the least covered file first", () => {
    assert.ok(markdown.indexOf("`src/b.ts`") < markdown.indexOf("`src/a.ts`"));
  });

  it("escapes a pipe in a file name so the table keeps its columns", () => {
    assert.match(
      renderCoverageMarkdown("t", parseLcov(record("a|b.ts", []))),
      /`a\\\|b\.ts`/,
    );
  });

  it("keeps a pipe escaped when a backslash comes before it", () => {
    const markdown = renderCoverageMarkdown(
      "t",
      parseLcov(record("C:\\x\\|y.ts", [])),
    );
    assert.ok(markdown.includes("`C:\\\\x\\\\\\|y.ts`"));
  });

  it("renders an empty report without failing", () => {
    assert.match(renderCoverageMarkdown("t", []), /Files \(0\)/);
  });
});
