import { describe, it } from "node:test";
import assert from "node:assert";
import type { OptionRow } from "../../src/utils/optionRows.ts";
import {
  hasOptionsToPreview,
  optionMovedDown,
  optionMovedUp,
  toOptionRows,
  toOptionTexts,
} from "../../src/utils/optionRows.ts";

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

// プレビューの開閉トグルを出すかどうか。新規商品の既定は [""] なので、長さで見ると
// 「何も設定していない商品」にもトグルが出てしまう。
describe("hasOptionsToPreview", () => {
  it("says yes once one option has something in it", () => {
    assert.strictEqual(hasOptionsToPreview(["サイズ,S,M"]), true);
    assert.strictEqual(hasOptionsToPreview(["", "のり"]), true);
  });

  it("says no for a brand-new item", () => {
    assert.strictEqual(hasOptionsToPreview([""]), false);
  });

  it("says no when every option is blank, however many there are", () => {
    assert.strictEqual(hasOptionsToPreview(["", "", ""]), false);
  });

  it("treats spaces as blank", () => {
    assert.strictEqual(hasOptionsToPreview([" ", "\t"]), false);
    assert.strictEqual(hasOptionsToPreview([" ", " の "]), true);
  });

  it("says no for an item with no option field at all", () => {
    assert.strictEqual(hasOptionsToPreview([]), false);
    assert.strictEqual(hasOptionsToPreview(null), false);
    assert.strictEqual(hasOptionsToPreview(undefined), false);
  });
});

// ↑↓ ボタンで1つずつ動かす。端から先へ動かそうとすると、直す前は配列に穴が空き、次の描画で
// itemOptions が split で落ちて編集画面ごと消えていた。
describe("optionMovedUp / optionMovedDown", () => {
  const options = ["A", "B", "C"];

  it("swaps a row with the one above it", () => {
    assert.deepStrictEqual(optionMovedUp(options, 1), ["B", "A", "C"]);
    assert.deepStrictEqual(optionMovedUp(options, 2), ["A", "C", "B"]);
  });

  it("swaps a row with the one below it", () => {
    assert.deepStrictEqual(optionMovedDown(options, 0), ["B", "A", "C"]);
    assert.deepStrictEqual(optionMovedDown(options, 1), ["A", "C", "B"]);
  });

  it("leaves the list alone at the ends", () => {
    assert.deepStrictEqual(optionMovedUp(options, 0), options);
    assert.deepStrictEqual(optionMovedDown(options, 2), options);
  });

  it("leaves the list alone for a row that is not there", () => {
    [-1, 3, 99].forEach((index) => {
      assert.deepStrictEqual(optionMovedUp(options, index), options);
      assert.deepStrictEqual(optionMovedDown(options, index), options);
    });
  });

  // 直す前に実際に起きていた壊れ方。長さが増えて穴が空く。
  it("never changes the length and never leaves a hole", () => {
    const lists = [[], ["A"], ["A", "B"], options, ["", "B", ""]];
    lists.forEach((list) => {
      for (let index = -2; index <= list.length + 1; index += 1) {
        [optionMovedUp(list, index), optionMovedDown(list, index)].forEach(
          (moved) => {
            assert.strictEqual(moved.length, list.length);
            moved.forEach((value) =>
              assert.strictEqual(typeof value, "string"),
            );
          },
        );
      }
    });
  });

  it("cannot move the only row there is", () => {
    assert.deepStrictEqual(optionMovedUp(["A"], 0), ["A"]);
    assert.deepStrictEqual(optionMovedDown(["A"], 0), ["A"]);
  });

  it("tolerates an item with no option field at all", () => {
    assert.deepStrictEqual(optionMovedUp(null, 0), []);
    assert.deepStrictEqual(optionMovedDown(undefined, 0), []);
  });

  it("does not modify what it was given", () => {
    const original = ["A", "B", "C"];
    optionMovedUp(original, 1);
    optionMovedDown(original, 1);
    assert.deepStrictEqual(original, ["A", "B", "C"]);
  });

  it("gives back a new array, so assigning it re-renders", () => {
    assert.notStrictEqual(optionMovedUp(options, 0), options);
    assert.notStrictEqual(optionMovedDown(options, 2), options);
  });
});
