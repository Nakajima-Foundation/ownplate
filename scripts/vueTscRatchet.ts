// vue-tsc の出力と据え置き一覧を突き合わせる。ここには純粋な処理だけを置く
// （実際に vue-tsc を走らせるのは vueTscBaseline.ts）。

export type Diagnostic = {
  file: string;
  line: number;
  column: number;
  code: string;
  message: string;
};

export type FileCounts = { [file: string]: number };

export type Baseline = {
  note: string;
  total: number;
  files: FileCounts;
};

export type Comparison = {
  regressed: { file: string; before: number; after: number }[];
  improved: { file: string; before: number; after: number }[];
  total: number;
  baselineTotal: number;
};

// vue-tsc は `src/x.vue(12,3): error TS2345: ...` の形で出す。
// ファイル名は欲張って取る。`[^(]+` にするとファイル名に含まれる `(` で
// 切れてしまい、その行を黙って落とす。
const DIAGNOSTIC_LINE = /^(.+)\((\d+),(\d+)\): error (TS\d+): (.*)$/;
// 診断の形に見える行。これに当たるのに DIAGNOSTIC_LINE で読めなければ、
// 数え方が実物に追いついていない。ファイル名を伴わない診断は行頭が
// `error TS...` になるので、直前のコロンを必須にしてはいけない。
const LOOKS_LIKE_ERROR = /(^|: )error TS\d+: /;

const readLine = (line: string): Diagnostic | null => {
  const matched = DIAGNOSTIC_LINE.exec(line);
  return matched === null
    ? null
    : {
        file: matched[1],
        line: Number(matched[2]),
        column: Number(matched[3]),
        code: matched[4],
        message: matched[5],
      };
};

// 数えるのは src/ の下だけ。node_modules 由来は repo の責任ではない。
export const parseVueTscOutput = (stdout: string): Diagnostic[] =>
  stdout
    .split("\n")
    .map(readLine)
    .filter((diagnostic): diagnostic is Diagnostic => diagnostic !== null)
    .filter((diagnostic) => diagnostic.file.startsWith("src/"));

// 読めなかった行。tsconfig が見つからないときの `error TS5058: ...` は
// ファイル名を伴わないのでここに来る。**読めない行があるまま数えると 0 件と出て、
// 据え置き一覧を空にしてしまい、門が二度と効かなくなる。**
export const findUnreadableErrorLines = (stdout: string): string[] =>
  stdout
    .split("\n")
    .filter((line) => LOOKS_LIKE_ERROR.test(line))
    .filter((line) => readLine(line) === null);

export const countByFile = (diagnostics: Diagnostic[]): FileCounts =>
  diagnostics.reduce<FileCounts>((counts, diagnostic) => {
    counts[diagnostic.file] = (counts[diagnostic.file] ?? 0) + 1;
    return counts;
  }, {});

export const totalOf = (counts: FileCounts): number =>
  Object.values(counts).reduce((sum, count) => sum + count, 0);

// ファイル単位で突き合わせる。行番号では突き合わせない — 1行足しただけで
// 後続がまるごとずれ、実際には何も増えていないのに増えたように見えるため。
export const compareToBaseline = (
  current: FileCounts,
  baseline: Baseline,
): Comparison => {
  const files = [
    ...new Set([...Object.keys(current), ...Object.keys(baseline.files)]),
  ].sort();
  const changes = files.map((file) => ({
    file,
    before: baseline.files[file] ?? 0,
    after: current[file] ?? 0,
  }));
  return {
    regressed: changes.filter((change) => change.after > change.before),
    improved: changes.filter((change) => change.after < change.before),
    total: totalOf(current),
    baselineTotal: baseline.total,
  };
};

export const buildBaseline = (current: FileCounts, note: string): Baseline => ({
  note,
  total: totalOf(current),
  files: Object.keys(current)
    .sort()
    .reduce<FileCounts>((sorted, file) => {
      sorted[file] = current[file];
      return sorted;
    }, {}),
});

const describe = (
  changes: { file: string; before: number; after: number }[],
): string[] =>
  changes.map(
    (change) => `  ${change.file}: ${change.before} → ${change.after}`,
  );

export const renderRatchetReport = (
  comparison: Comparison,
  updateCommand: string,
): { text: string; ok: boolean } => {
  const lines: string[] = [];
  const ok =
    comparison.regressed.length === 0 && comparison.improved.length === 0;
  if (comparison.regressed.length > 0) {
    lines.push("vue-tsc: 据え置き一覧より増えているファイルがあります。");
    lines.push(...describe(comparison.regressed));
    lines.push("");
    lines.push(
      "この変更で新しい型エラーが入りました。直してから push してください。",
    );
  }
  if (comparison.improved.length > 0) {
    lines.push("vue-tsc: 据え置き一覧より減っているファイルがあります。");
    lines.push(...describe(comparison.improved));
    lines.push("");
    lines.push(`一覧を更新してください: ${updateCommand}`);
  }
  if (ok) {
    lines.push("vue-tsc: 据え置き一覧どおりです。");
  }
  lines.push(
    `  合計 ${comparison.total} 件（一覧: ${comparison.baselineTotal} 件）`,
  );
  return { text: lines.join("\n"), ok };
};
