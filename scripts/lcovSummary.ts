export type CoverageCount = { hit: number; found: number };

export type FileCoverage = {
  file: string;
  lines: CoverageCount;
  branches: CoverageCount;
  functions: CoverageCount;
};

const METRICS = ["lines", "branches", "functions"] as const;
type Metric = (typeof METRICS)[number];

const COUNT_KEYS: Record<Metric, { hit: string; found: string }> = {
  lines: { hit: "LH", found: "LF" },
  branches: { hit: "BRH", found: "BRF" },
  functions: { hit: "FNH", found: "FNF" },
};

const BAR_CELLS = 10;
const PERCENT = 100;
const GOOD_PERCENT = 90;
const FAIR_PERCENT = 75;

const readFields = (record: string) => {
  const fields = new Map<string, string>();
  record.split("\n").forEach((line) => {
    const separator = line.indexOf(":");
    if (separator > 0) {
      fields.set(
        line.slice(0, separator).trim(),
        line.slice(separator + 1).trim(),
      );
    }
  });
  return fields;
};

const readNumber = (fields: Map<string, string>, key: string) =>
  Number(fields.get(key) ?? 0) || 0;

const readCount = (
  fields: Map<string, string>,
  metric: Metric,
): CoverageCount => ({
  hit: readNumber(fields, COUNT_KEYS[metric].hit),
  found: readNumber(fields, COUNT_KEYS[metric].found),
});

const relativePath = (file: string, root: string) => {
  const prefix = root.endsWith("/") ? root : `${root}/`;
  return root !== "" && file.startsWith(prefix)
    ? file.slice(prefix.length)
    : file;
};

export const parseLcov = (lcovText: string, root = ""): FileCoverage[] =>
  lcovText
    .split("end_of_record")
    .map(readFields)
    .filter((fields) => fields.has("SF"))
    .map((fields) => ({
      file: relativePath(fields.get("SF") ?? "", root),
      lines: readCount(fields, "lines"),
      branches: readCount(fields, "branches"),
      functions: readCount(fields, "functions"),
    }));

const addCounts = (a: CoverageCount, b: CoverageCount): CoverageCount => ({
  hit: a.hit + b.hit,
  found: a.found + b.found,
});

export const totalCoverage = (
  files: FileCoverage[],
): Omit<FileCoverage, "file"> => {
  const zero = { hit: 0, found: 0 };
  return files.reduce(
    (total, file) => ({
      lines: addCounts(total.lines, file.lines),
      branches: addCounts(total.branches, file.branches),
      functions: addCounts(total.functions, file.functions),
    }),
    { lines: zero, branches: zero, functions: zero },
  );
};

export const percentOf = (count: CoverageCount): number | undefined =>
  count.found === 0 ? undefined : (count.hit / count.found) * PERCENT;

const colorOf = (percent: number) => {
  if (percent >= GOOD_PERCENT) return "🟢";
  if (percent >= FAIR_PERCENT) return "🟡";
  return "🔴";
};

export const barOf = (percent: number) => {
  const filled = Math.round((percent / PERCENT) * BAR_CELLS);
  return "█".repeat(filled) + "░".repeat(BAR_CELLS - filled);
};

export const formatCell = (count: CoverageCount) => {
  const percent = percentOf(count);
  if (percent === undefined) return "—";
  return `${colorOf(percent)} ${percent.toFixed(2)}% \`${barOf(percent)}\``;
};

const escapeCell = (text: string) => text.replace(/[\\|]/g, "\\$&");

const fileRow = (file: FileCoverage) =>
  `| \`${escapeCell(file.file)}\` | ${METRICS.map((metric) => formatCell(file[metric])).join(" | ")} |`;

const sortKey = (file: FileCoverage) => percentOf(file.lines) ?? PERCENT;

const byLineCoverage = (a: FileCoverage, b: FileCoverage) =>
  sortKey(a) - sortKey(b) || a.file.localeCompare(b.file);

export const renderCoverageMarkdown = (
  title: string,
  files: FileCoverage[],
) => {
  const total = totalCoverage(files);
  const header =
    "| | Lines | Branches | Functions |\n| --- | --- | --- | --- |";
  const lines = [
    `## 🧪 Coverage: ${title}`,
    "",
    header,
    `| **Total** | ${METRICS.map((metric) => formatCell(total[metric])).join(" | ")} |`,
    "",
  ];
  lines.push(
    `<details><summary>Files (${files.length})</summary>`,
    "",
    header.replace("| |", "| File |"),
  );
  [...files].sort(byLineCoverage).forEach((file) => lines.push(fileRow(file)));
  lines.push("", "</details>", "");
  return lines.join("\n");
};
