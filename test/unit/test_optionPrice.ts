import { describe, it } from "node:test";
import assert from "node:assert";
import { optionPrice, optionChoicesAt } from "../../src/utils/commonUtils.ts";

// オプションは "サイズ,S(+100),M(+200)" のように1つの組を1つの文字列に詰めて保存し、
// 注文は選んだ位置だけを保存する。店舗があとから組を減らしたり並べ替えたりすると、
// 既存の注文から存在しない位置・存在しない選択肢を引くことが実際に起きる。
// ここが投げると、店主には「internal」としか出ない。

// 旧い実装との突き合わせに使った生成器。どの入力が効くかを残しておくために、
// 台ではなくここに置く。
const optionStrings = (): string[] => {
  const names = ["S", "サイズ", "", " ", "のり"];
  const prices = [
    "(+100)",
    "(-50)",
    "(＋1000)",
    "(ー200)",
    "(−3.5)",
    "(+0)",
    "()",
    "(+abc)",
    "",
  ];
  const suffixes = ["", " ", "(+1)"];
  return names.flatMap((name) =>
    prices.flatMap((price) => suffixes.map((suffix) => name + price + suffix)),
  );
};

describe("optionPrice", () => {
  it("never throws, whatever the caller hands it", () => {
    [...optionStrings(), "", null, undefined].forEach((option) => {
      assert.doesNotThrow(() => optionPrice(option));
      assert.strictEqual(typeof optionPrice(option), "number");
    });
  });

  it("reads a missing option as no extra charge", () => {
    assert.strictEqual(optionPrice(undefined), 0);
    assert.strictEqual(optionPrice(null), 0);
    assert.strictEqual(optionPrice(""), 0);
  });

  it("reads the charge written inside the choice's name", () => {
    assert.strictEqual(optionPrice("L(+300)"), 300);
    assert.strictEqual(optionPrice("S(-50)"), -50);
    assert.strictEqual(optionPrice("M(+3.5)"), 3.5);
  });

  // 店舗オーナーは全角で打つ。半角に直さないと注文の合計が狂う。
  it("treats the full-width signs the owner types as their half-width form", () => {
    assert.strictEqual(optionPrice("大(＋1000)"), optionPrice("大(+1000)"));
    assert.strictEqual(optionPrice("小(ー200)"), optionPrice("小(-200)"));
    assert.strictEqual(optionPrice("小(−200)"), optionPrice("小(-200)"));
  });

  it("reads a choice with no charge in its name as zero", () => {
    assert.strictEqual(optionPrice("のり"), 0);
    assert.strictEqual(optionPrice("のり()"), 0);
    assert.strictEqual(optionPrice("のり(+abc)"), 0);
  });
});

describe("optionChoicesAt", () => {
  const groups = ["サイズ,S(+100),M(+200)", "のり"];

  it("splits the group the position points at", () => {
    assert.deepStrictEqual(optionChoicesAt(groups, 0), [
      "サイズ",
      "S(+100)",
      "M(+200)",
    ]);
    assert.deepStrictEqual(optionChoicesAt(groups, 1), ["のり"]);
  });

  // 注文したあとに店舗が組を減らすと、保存された位置が範囲の外に出る。
  it("never throws and never returns nothing when the position is gone", () => {
    [groups, [""], [], null, undefined].forEach((list) => {
      [0, 1, 2, 5, -1].forEach((index) => {
        const choices = optionChoicesAt(list, index);
        assert.ok(Array.isArray(choices));
        assert.ok(
          choices.length > 0,
          "呼び出し側が opt[0] を読むので空にできない",
        );
      });
    });
  });

  it("reads a gone position as a single empty choice, which prices at zero", () => {
    assert.deepStrictEqual(optionChoicesAt(groups, 5), [""]);
    assert.strictEqual(optionPrice(optionChoicesAt(groups, 5)[0]), 0);
  });
});

// 実際に起きる並び: 店舗が組を減らしたあと、既存の注文を読み直す。
describe("組が減ったあとの既存の注文", () => {
  it("prices without throwing, counting the gone group as nothing", () => {
    const afterTheOwnerRemovedAGroup = ["サイズ,S(+100),M(+200)"];
    const savedSelection = [1, 0]; // 2つ目の組はもう無い
    const total = savedSelection.reduce((sum, selected, key) => {
      const choices = optionChoicesAt(afterTheOwnerRemovedAGroup, key);
      return (
        sum + optionPrice(choices.length === 1 ? choices[0] : choices[selected])
      );
    }, 0);
    assert.strictEqual(total, 100);
  });
});
