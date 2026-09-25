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

// 数えるのはここの下だけ。
const COUNTED_PREFIX = "src/";
// 読めたうえで数えないと決めた場所。repo の責任でないものだけを挙げる。
// ここに無い場所が出てきたら、数え方が実物に追いついていないので止める
// （絶対パスや Windows 形式で来ると、黙って捨てられてしまうため）。
const IGNORED_PREFIXES = ["node_modules/"];

const isCounted = (file: string) => file.startsWith(COUNTED_PREFIX);
const isIgnored = (file: string) =>
  IGNORED_PREFIXES.some((prefix) => file.startsWith(prefix));

export const parseVueTscOutput = (stdout: string): Diagnostic[] =>
  stdout
    .split("\n")
    .map(readLine)
    .filter((diagnostic): diagnostic is Diagnostic => diagnostic !== null)
    .filter((diagnostic) => isCounted(diagnostic.file));

// 数えも見送りもできなかった行。tsconfig が見つからないときの `error TS5058: ...`
// （ファイル名を伴わない）や、知らない場所を指す行がここに来る。
// **読めない行があるまま数えると少なく出て、据え置き一覧を緩めてしまう。**
export const findUnreadableErrorLines = (stdout: string): string[] =>
  stdout
    .split("\n")
    .filter((line) => LOOKS_LIKE_ERROR.test(line))
    .filter((line) => {
      const diagnostic = readLine(line);
      return (
        diagnostic === null ||
        !(isCounted(diagnostic.file) || isIgnored(diagnostic.file))
      );
    });

// vue-tsc の終わり方。指摘が無ければ 0、あれば 2 を返す。
// それ以外や、合図で殺された場合は、出力が途中で切れている恐れがある。
const NO_DIAGNOSTICS = 0;
const DIAGNOSTICS_REPORTED = 2;

const isRecord = (value: unknown): value is { [key: string]: unknown } =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isFileCounts = (value: unknown): value is FileCounts =>
  isRecord(value) &&
  Object.values(value).every((count) => typeof count === "number");

// 壊れた一覧を「無い」と同じに扱うと、空化や増加の守りをすり抜ける。
// 無いのか壊れているのかを、呼ぶ側が区別できるようにする。
export const describeInvalidBaseline = (parsed: unknown): string | null => {
  if (!isRecord(parsed)) {
    return "据え置き一覧の形が違います。";
  }
  if (!isFileCounts(parsed.files)) {
    return "据え置き一覧の files が読めません。";
  }
  if (parsed.total !== totalOf(parsed.files)) {
    return `据え置き一覧の total が内訳と合いません（total: ${String(parsed.total)} / 内訳: ${totalOf(parsed.files)}）。`;
  }
  return null;
};

// **ここが ratchet の要。** 一覧を増やす更新を断る。増えたぶんを書き込めるなら、
// 新しい型エラーを入れて --update するだけで通ってしまい、門の意味が無くなる。
// 本当に増やす必要があるなら、一覧を手で直す（差分がレビューに残る）。
export const refuseBaselineUpdate = (
  current: FileCounts,
  previous: Baseline | null,
  allowEmpty: boolean,
): string | null => {
  if (previous === null) {
    return null;
  }
  const { regressed } = compareToBaseline(current, previous);
  if (regressed.length > 0) {
    return [
      "vue-tsc: 増えたぶんを据え置き一覧に書き込むことはできません。",
      ...regressed.map(
        (change) => `  ${change.file}: ${change.before} → ${change.after}`,
      ),
      "",
      "入った型エラーを直してください。",
      "増やすことが本当に必要なら、一覧を手で直してください（差分がレビューに残ります）。",
    ].join("\n");
  }
  // 一覧を空にする更新は、門を外すのと同じ。**本当に全部直ったのか、設定の
  // 取りこぼしで 0 件になったのかは、数からは区別できない。** 前者なら明示して通す。
  if (!allowEmpty && totalOf(current) === 0 && previous.total > 0) {
    return [
      "vue-tsc: 指摘が 0 件でした。据え置き一覧を空にすると門が効かなくなります。",
      "  設定の取りこぼしで 0 件になっていないか確かめてください。",
      "  本当に全部直ったのなら --allow-empty を付けてください。",
    ].join("\n");
  }
  return null;
};

export const describeAbnormalExit = (
  status: number | null,
  signal: string | null,
): string | null => {
  if (signal !== null) {
    return `vue-tsc が ${signal} で終わりました。出力が途中で切れています。`;
  }
  if (status !== NO_DIAGNOSTICS && status !== DIAGNOSTICS_REPORTED) {
    return `vue-tsc の終了コードが ${status} でした。数え方が追いついていません。`;
  }
  return null;
};

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
