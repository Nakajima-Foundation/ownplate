import { describe, it } from "node:test";
import assert from "node:assert";

import {
  buildBaseline,
  compareToBaseline,
  countByFile,
  describeAbnormalExit,
  findUnreadableErrorLines,
  parseVueTscOutput,
  renderRatchetReport,
  totalOf,
  type Baseline,
} from "../../scripts/vueTscRatchet.ts";

// vue-tsc の据え置き一覧。**これが CI の合否を決める**ので、
// 増えたのに気づかない・減ったのに一覧が古いまま、のどちらも起きてはいけない。

const OUTPUT = [
  "src/app/user/RestaurantPage.vue(10,5): error TS2345: Argument of type 'A' is not assignable.",
  "src/app/user/RestaurantPage.vue(20,7): error TS2339: Property 'x' does not exist.",
  "src/components/Map.vue(3,1): error TS18047: 'map' is possibly 'null'.",
].join("\n");

const baselineOf = (files: { [file: string]: number }): Baseline => ({
  note: "test",
  total: totalOf(files),
  files,
});

describe("vue-tsc の出力を読む", () => {
  it("ファイル・行・桁・番号・本文を取り出す", () => {
    const [first] = parseVueTscOutput(OUTPUT);
    assert.deepStrictEqual(first, {
      file: "src/app/user/RestaurantPage.vue",
      line: 10,
      column: 5,
      code: "TS2345",
      message: "Argument of type 'A' is not assignable.",
    });
  });

  it("3件とも拾う", () => {
    assert.strictEqual(parseVueTscOutput(OUTPUT).length, 3);
  });

  // 要約の行や空行を数に入れない。入れると合計がずれる。
  it("診断以外の行は数えない", () => {
    const noisy = [
      "Files:  1234",
      "",
      "Found 3 errors in 2 files.",
      OUTPUT,
    ].join("\n");
    assert.strictEqual(parseVueTscOutput(noisy).length, 3);
  });

  // node_modules 由来の指摘は repo の責任ではないので数えない。
  it("src/ の外は数えない", () => {
    const outside =
      "node_modules/foo/index.d.ts(1,1): error TS2304: Cannot find name 'x'.";
    assert.strictEqual(parseVueTscOutput(outside).length, 0);
  });

  // ファイル名に括弧が入ると、途中で切る書き方では**黙って落ちる**。
  // 落ちた行はどこにも出ないので、門が素通しになったことに気づけない。
  it("ファイル名に括弧が入っていても読める", () => {
    const parenthesised =
      "src/components/probe(paren).vue(3,7): error TS2322: Type 'string' is not assignable.";
    const [diagnostic] = parseVueTscOutput(parenthesised);
    assert.strictEqual(diagnostic.file, "src/components/probe(paren).vue");
    assert.strictEqual(diagnostic.line, 3);
    assert.strictEqual(diagnostic.column, 7);
  });

  it("警告は数えない。落とすのはエラーだけ", () => {
    const warning = "src/app/user/Foo.vue(1,1): warning TS6133: unused.";
    assert.strictEqual(parseVueTscOutput(warning).length, 0);
  });
});

describe("ファイルごとに数える", () => {
  it("同じファイルの分をまとめる", () => {
    assert.deepStrictEqual(countByFile(parseVueTscOutput(OUTPUT)), {
      "src/app/user/RestaurantPage.vue": 2,
      "src/components/Map.vue": 1,
    });
  });

  it("何も出なければ空", () => {
    assert.deepStrictEqual(countByFile([]), {});
    assert.strictEqual(totalOf({}), 0);
  });
});

describe("据え置き一覧との突き合わせ", () => {
  const baseline = baselineOf({ "a.vue": 2, "b.vue": 1 });

  it("同じなら増減なし", () => {
    const result = compareToBaseline({ "a.vue": 2, "b.vue": 1 }, baseline);
    assert.deepStrictEqual(result.regressed, []);
    assert.deepStrictEqual(result.improved, []);
  });

  // ここが本題。新しい型エラーを入れたら落ちなければならない。
  it("既にあるファイルで増えたら増加として挙げる", () => {
    const result = compareToBaseline({ "a.vue": 3, "b.vue": 1 }, baseline);
    assert.deepStrictEqual(result.regressed, [
      { file: "a.vue", before: 2, after: 3 },
    ]);
  });

  it("一覧に無いファイルで出たら増加として挙げる", () => {
    const result = compareToBaseline(
      { "a.vue": 2, "b.vue": 1, "c.vue": 1 },
      baseline,
    );
    assert.deepStrictEqual(result.regressed, [
      { file: "c.vue", before: 0, after: 1 },
    ]);
  });

  it("減ったら減少として挙げる", () => {
    const result = compareToBaseline({ "a.vue": 1, "b.vue": 1 }, baseline);
    assert.deepStrictEqual(result.improved, [
      { file: "a.vue", before: 2, after: 1 },
    ]);
  });

  // ファイルごと消えた場合も減少。合計だけ見ていると、別のファイルで
  // 増えた分と相殺されて気づけない。
  it("ファイルごと無くなっても減少として挙げる", () => {
    const result = compareToBaseline({ "b.vue": 1 }, baseline);
    assert.deepStrictEqual(result.improved, [
      { file: "a.vue", before: 2, after: 0 },
    ]);
  });

  // 合計が同じでも、中身が動いていれば見逃さないこと。
  it("合計が変わらなくても、増えたファイルと減ったファイルを両方挙げる", () => {
    const result = compareToBaseline({ "a.vue": 1, "b.vue": 2 }, baseline);
    assert.strictEqual(result.total, baseline.total);
    assert.deepStrictEqual(result.regressed, [
      { file: "b.vue", before: 1, after: 2 },
    ]);
    assert.deepStrictEqual(result.improved, [
      { file: "a.vue", before: 2, after: 1 },
    ]);
  });
});

describe("合否の判定", () => {
  const baseline = baselineOf({ "a.vue": 2 });
  const report = (current: { [file: string]: number }) =>
    renderRatchetReport(compareToBaseline(current, baseline), "yarn x");

  it("一覧どおりなら通す", () => {
    assert.strictEqual(report({ "a.vue": 2 }).ok, true);
  });

  it("増えたら落とす", () => {
    assert.strictEqual(report({ "a.vue": 3 }).ok, false);
  });

  // 減ったときも落とす。そうしないと一覧が古いまま残り、
  // 次に誰かが入れた分をその余白が吸ってしまう。
  it("減ったときも落として、一覧の更新を促す", () => {
    const result = report({ "a.vue": 1 });
    assert.strictEqual(result.ok, false);
    assert.ok(result.text.includes("yarn x"));
  });

  it("増えたときは増えたファイルを本文に出す", () => {
    assert.ok(report({ "a.vue": 3 }).text.includes("a.vue: 2 → 3"));
  });
});

describe("一覧の書き出し", () => {
  it("合計を数え、ファイル名を並べ替える", () => {
    const written = buildBaseline({ "b.vue": 1, "a.vue": 2 }, "note");
    assert.strictEqual(written.total, 3);
    assert.deepStrictEqual(Object.keys(written.files), ["a.vue", "b.vue"]);
  });
});

// 数え方が実物に追いつかなくなったときに、**黙って 0 件にしない**ための守り。
// ここが無いと、tsconfig を見失っただけで「全部直った」と判定され、
// --update で一覧が空になり、門が二度と効かなくなる。
describe("読めない出力を見つける", () => {
  it("ファイル名を伴わないエラーを拾う", () => {
    const configError =
      "error TS5058: The specified path does not exist: 'nonexistent.json'.";
    assert.deepStrictEqual(findUnreadableErrorLines(configError), [
      configError,
    ]);
    // 数えるほうは 0 件を返す。だからこそ上の守りが要る。
    assert.strictEqual(parseVueTscOutput(configError).length, 0);
  });

  it("読める診断は読めない扱いにしない", () => {
    assert.deepStrictEqual(findUnreadableErrorLines(OUTPUT), []);
  });

  // src/ の外は「読めた上で数えない」。読めないのとは別。
  it("node_modules の指摘は読めない扱いにしない", () => {
    const outside =
      "node_modules/foo/index.d.ts(1,1): error TS2304: Cannot find name 'x'.";
    assert.deepStrictEqual(findUnreadableErrorLines(outside), []);
    assert.strictEqual(parseVueTscOutput(outside).length, 0);
  });

  it("要約や空行は読めない扱いにしない", () => {
    assert.deepStrictEqual(
      findUnreadableErrorLines("Found 3 errors in 2 files.\n\n"),
      [],
    );
  });
});

// 絶対パスや Windows 形式で来ると、読めてはいるのに src/ で始まらないので
// 数から外れる。**黙って外れると門が緩む**ので、読めない扱いにして止める。
describe("知らない場所を指す診断", () => {
  it("絶対パスは読めない扱いにする", () => {
    const absolute =
      "/Users/who/repo/src/components/Abs.vue(3,7): error TS2322: Type 'string'.";
    assert.strictEqual(parseVueTscOutput(absolute).length, 0);
    assert.deepStrictEqual(findUnreadableErrorLines(absolute), [absolute]);
  });

  it("Windows 形式のパスも読めない扱いにする", () => {
    const windows =
      "C:\\repo\\src\\components\\Win.vue(3,7): error TS2322: Type 'string'.";
    assert.strictEqual(parseVueTscOutput(windows).length, 0);
    assert.deepStrictEqual(findUnreadableErrorLines(windows), [windows]);
  });

  // node_modules だけは「読めたうえで数えない」と決めてある。
  it("node_modules は見送る場所として挙げてあるので止めない", () => {
    const outside =
      "node_modules/foo/index.d.ts(1,1): error TS2304: Cannot find name 'x'.";
    assert.deepStrictEqual(findUnreadableErrorLines(outside), []);
  });
});

// 出力が途中で切れたまま数えると、少なく出たぶんだけ据え置き一覧が緩む。
describe("vue-tsc の終わり方", () => {
  it("指摘なし（0）と指摘あり（2）は正常", () => {
    assert.strictEqual(describeAbnormalExit(0, null), null);
    assert.strictEqual(describeAbnormalExit(2, null), null);
  });

  // 殺されたとき status は null、signal に名前が入る。
  it("合図で殺されたら止める", () => {
    assert.ok(describeAbnormalExit(null, "SIGTERM")?.includes("SIGTERM"));
    assert.ok(describeAbnormalExit(137, "SIGKILL")?.includes("SIGKILL"));
  });

  it("知らない終了コードでも止める", () => {
    assert.ok(describeAbnormalExit(1, null)?.includes("1"));
    assert.ok(describeAbnormalExit(null, null) !== null);
  });
});
