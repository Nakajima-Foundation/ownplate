import { describe, it } from "node:test";
import assert from "node:assert";
import type { OptionRow } from "../../src/utils/optionRows.ts";
import { toOptionRows, toOptionTexts } from "../../src/utils/optionRows.ts";

// オプションは店舗オーナーが打った文字列そのものなので、空のまま2つ追加する・同じ名前を
// 2つ作る、が普通に起きる。目印は Vue が行を照合する鍵になるので、重複するとドラッグのあと
// 行が増えたり消えたりする。重複した中身でも目印が重ならないことがこの関数の存在理由。
describe("toOptionRows", () => {
  it("gives every row a distinct id even when the texts are identical", () => {
    const rows = toOptionRows(["", "", "サイズ", "サイズ"]);
    const ids = rows.map((row) => row.id);
    assert.strictEqual(new Set(ids).size, rows.length);
  });

  it("keeps the text of each row in place", () => {
    assert.deepStrictEqual(toOptionRows(["a", "b"]), [
      { id: 0, text: "a" },
      { id: 1, text: "b" },
    ]);
  });

  it("returns nothing for an empty list", () => {
    assert.deepStrictEqual(toOptionRows([]), []);
  });
});

const permutations = <T>(values: T[]): T[][] => {
  if (values.length <= 1) {
    return [values];
  }
  return values.flatMap((value, index) => {
    const rest = [...values.slice(0, index), ...values.slice(index + 1)];
    return permutations(rest).map((tail) => [value, ...tail]);
  });
};

// 並べ替えは中身の入れ替えでしかない。どう動かしてもオプションが消えたり増えたりしない、
// というのが画面側が頼っている性質。
describe("並べ替えの往復", () => {
  const cases: string[][] = [
    [],
    [""],
    ["サイズ"],
    ["", ""],
    ["サイズ,S,M,L", "", "トッピング,ネギ,のり", "サイズ,S,M,L"],
  ];

  cases.forEach((options) => {
    it(`preserves the contents for ${JSON.stringify(options)}`, () => {
      assert.deepStrictEqual(toOptionTexts(toOptionRows(options)), options);
    });
  });

  it("yields exactly the reordered texts for every permutation", () => {
    const options = ["", "サイズ,S,M", "", "のり"];
    const rows = toOptionRows(options);
    permutations(rows).forEach((reordered: OptionRow[]) => {
      const texts = toOptionTexts(reordered);
      assert.strictEqual(texts.length, options.length);
      assert.deepStrictEqual([...texts].sort(), [...options].sort());
      assert.deepStrictEqual(
        texts,
        reordered.map((row) => options[row.id]),
      );
    });
  });
});
