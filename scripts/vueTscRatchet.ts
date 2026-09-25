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
// 先頭を src/ に絞ってあるのは、node_modules 由来の指摘を数に入れないため。
const DIAGNOSTIC_LINE = /^(src\/[^(]+)\((\d+),(\d+)\): error (TS\d+): (.*)$/;

export const parseVueTscOutput = (stdout: string): Diagnostic[] =>
  stdout
    .split("\n")
    .map((line) => DIAGNOSTIC_LINE.exec(line))
    .filter((matched): matched is RegExpExecArray => matched !== null)
    .map((matched) => ({
      file: matched[1],
      line: Number(matched[2]),
      column: Number(matched[3]),
      code: matched[4],
      message: matched[5],
    }));

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
