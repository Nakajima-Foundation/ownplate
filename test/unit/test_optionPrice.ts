import { describe, it } from "node:test";
import assert from "node:assert";
import {
  optionPrice,
  optionChoicesAt,
  selectedOptionsPrice,
  selectedOptionNames,
} from "../../src/utils/commonUtils.ts";

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
          '組が無いときも [""]。直す前の (x || "").split(",") と同じ形なので、' +
            "選択肢ひとつの組として扱う枝がそのまま通る",
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

describe("selectedOptionsPrice", () => {
  const groups = ["サイズ,S(+100),M(+200),L(+300)", "のり(+50)"];
  const YEN = 1;

  it("returns the base price when nothing is selected", () => {
    assert.strictEqual(selectedOptionsPrice([], groups, YEN, 1000), 1000);
  });

  it("adds a single-choice group only when it is checked", () => {
    assert.strictEqual(
      selectedOptionsPrice([0, true], groups, YEN, 1000),
      1050,
    );
    assert.strictEqual(
      selectedOptionsPrice([0, false], groups, YEN, 1000),
      1000,
    );
  });

  it("adds the choice the position points at", () => {
    assert.strictEqual(
      selectedOptionsPrice([3, false], groups, YEN, 1000),
      1300,
    );
    assert.strictEqual(
      selectedOptionsPrice([1, false], groups, YEN, 1000),
      1100,
    );
  });

  it("reads a selection stored as a string the same as a number", () => {
    assert.strictEqual(
      selectedOptionsPrice(["3", false], groups, YEN, 1000),
      selectedOptionsPrice([3, false], groups, YEN, 1000),
    );
  });

  it("defaults the base price to nothing", () => {
    assert.strictEqual(selectedOptionsPrice([3, true], groups, YEN), 350);
  });

  // 店舗があとから組や選択肢を減らすと、保存された位置が範囲の外に出る。
  it("charges nothing for a position that no longer exists", () => {
    assert.strictEqual(
      selectedOptionsPrice([9, false], groups, YEN, 1000),
      1000,
    );
    assert.strictEqual(
      selectedOptionsPrice([3, false, true], groups, YEN, 1000),
      1300,
    );
    assert.strictEqual(selectedOptionsPrice([1, true], null, YEN, 1000), 1000);
    assert.strictEqual(
      selectedOptionsPrice([1, true], undefined, YEN, 1000),
      1000,
    );
  });

  it("never throws, whatever the stored selection turns out to be", () => {
    const selections = [
      [],
      [true],
      [false],
      [0],
      [5],
      [null],
      [1, null, true],
      ["1", "0"],
    ];
    const groupSets = [groups, ["単品(+3.5)"], [""], []];
    groupSets.forEach((list) => {
      selections.forEach((selected) => {
        [1, 100].forEach((priceMultiple) => {
          assert.doesNotThrow(() =>
            selectedOptionsPrice(selected, list, priceMultiple, 1000),
          );
        });
      });
    });
  });

  // 小数のある通貨では店舗の刻みで丸める。円（刻み1）では小数が落ちる。
  it("rounds each option to the currency's step", () => {
    assert.strictEqual(selectedOptionsPrice([true], ["単品(+3.5)"], 1, 0), 4);
    assert.strictEqual(
      selectedOptionsPrice([true], ["単品(+3.5)"], 100, 0),
      3.5,
    );
  });
});

// 注文に保存される「表示用の選択肢」。いままで画面側が作って送っていたものを、サーバが
// 同じ規則で作り直す。規則がずれると、すべての注文のレシートが変わる。
describe("selectedOptionNames", () => {
  const groups = ["サイズ,S(+100),M(+200),L(+300)", "のり(+50)"];

  it("names the choice each position points at", () => {
    assert.deepStrictEqual(selectedOptionNames([3, true], groups), [
      "L(+300)",
      "のり(+50)",
    ]);
    assert.deepStrictEqual(selectedOptionNames([1, false], groups), [
      "S(+100)",
      "",
    ]);
  });

  it("names nothing for an unchecked single-choice group", () => {
    assert.deepStrictEqual(selectedOptionNames([0, false], groups), [
      "サイズ",
      "",
    ]);
  });

  it("reads a multi-choice position stored as a string the same as a number", () => {
    assert.deepStrictEqual(
      selectedOptionNames(["3", false], groups),
      selectedOptionNames([3, false], groups),
    );
  });

  // 単一選択の組は真偽で判定するので、文字列の "0" は「入」、数値の 0 は「切」。
  // 直感に反するが、金額側（selectedOptionsPrice）も同じ判定なので両者は食い違わない。
  // ここを「揃える」と、保存済みの注文のレシートと請求額がずれる。
  it("agrees with the price on which single-choice groups count as checked", () => {
    [
      ["3", "0"],
      [3, 0],
      ["3", 0],
      [3, "0"],
    ].forEach((selected) => {
      const names = selectedOptionNames(selected, groups);
      const price = selectedOptionsPrice(selected, groups, 1, 1000);
      const charged = names[1] === "" ? 1300 : 1350;
      assert.strictEqual(price, charged);
    });
  });

  it("trims the spaces the owner typed around a choice", () => {
    assert.deepStrictEqual(selectedOptionNames([1], ["サイズ, 小 , 大 "]), [
      "小",
    ]);
  });

  // 店舗が組や選択肢を減らすと、保存された位置が範囲の外に出る。
  it("names nothing for a position that no longer exists", () => {
    assert.deepStrictEqual(selectedOptionNames([9, true, true], groups), [
      "",
      "のり(+50)",
      "",
    ]);
    assert.deepStrictEqual(selectedOptionNames([1, true], null), ["", ""]);
  });

  it("never throws, whatever the stored selection turns out to be", () => {
    [
      [],
      [true],
      [false],
      [0],
      [5],
      [null],
      [1, null, true],
      ["1", "0"],
    ].forEach((selected) => {
      [groups, ["単品(+3.5)"], [""], [], null, undefined].forEach((list) => {
        assert.doesNotThrow(() => selectedOptionNames(selected, list));
      });
    });
  });

  // 金額と名前は同じ入力・同じ組から出る。片方だけずれると、レシートと請求額が食い違う。
  it("names the choice the price was taken from", () => {
    const selected = [3, true];
    assert.deepStrictEqual(selectedOptionNames(selected, groups), [
      "L(+300)",
      "のり(+50)",
    ]);
    assert.strictEqual(selectedOptionsPrice(selected, groups, 1, 1000), 1350);

    const reordered = ["のり(+50)", "サイズ,S(+100),M(+200),L(+300)"];
    assert.deepStrictEqual(selectedOptionNames(selected, reordered), [
      "のり(+50)",
      "S(+100)",
    ]);
    assert.strictEqual(
      selectedOptionsPrice(selected, reordered, 1, 1000),
      1150,
    );
  });
});
