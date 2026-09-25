import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

import {
  buildBaseline,
  compareToBaseline,
  countByFile,
  describeAbnormalExit,
  findUnreadableErrorLines,
  describeUnusableBaseline,
  parseVueTscOutput,
  refuseBaselineUpdate,
  renderRatchetReport,
  type Baseline,
} from "./vueTscRatchet.ts";

const BASELINE_PATH = "vue-tsc-baseline.json";
const UPDATE_COMMAND = "yarn typecheck:vue --update";
const NOTE =
  "vue-tsc の据え置き一覧。減る方向にしか動かさない。直したら --update で更新する。";

// repo の vue-tsc を直に呼ぶ。npx だと別の TypeScript を連れてきて落ちる。
const runVueTsc = (): string => {
  const result = spawnSync(
    "./node_modules/.bin/vue-tsc",
    ["--noEmit", "-p", "tsconfig.json"],
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  );
  if (result.error) {
    throw new Error("vue-tsc を起動できませんでした", { cause: result.error });
  }
  // 途中で切れた出力を数えると、少なく出たぶんだけ据え置き一覧が緩む。
  const abnormal = describeAbnormalExit(result.status, result.signal);
  if (abnormal !== null) {
    throw new Error(abnormal);
  }
  return `${result.stdout ?? ""}${result.stderr ?? ""}`;
};

// 無いのか壊れているのかを区別する。壊れているのを「無い」と同じに扱うと、
// 空化や増加の守りをすり抜ける。
const readBaseline = (): Baseline | null => {
  let raw: string;
  try {
    raw = readFileSync(BASELINE_PATH, "utf8");
  } catch {
    return null;
  }
  const parsed: unknown = JSON.parse(raw);
  const unusable = describeUnusableBaseline(parsed, BASELINE_PATH, UPDATE_COMMAND);
  if (unusable !== null) {
    throw new Error(unusable);
  }
  return parsed;
};

const requireBaseline = (): Baseline => {
  const baseline = readBaseline();
  if (baseline === null) {
    throw new Error(
      `${BASELINE_PATH} がありません。${UPDATE_COMMAND} で作ってください。`,
    );
  }
  return baseline;
};

// 読めない行があったら、数えずに落とす。tsconfig が見つからないときのように
// 診断が1件も取れないまま --update すると、一覧が空になって門が効かなくなる。
const refuseUnreadable = (output: string) => {
  const unreadable = findUnreadableErrorLines(output);
  if (unreadable.length === 0) {
    return;
  }
  const lines = [
    "vue-tsc: 読めない出力がありました。数えずに止めます。",
    ...unreadable.map((line) => `  ${line}`),
  ];
  throw new Error(lines.join("\n"));
};

const main = () => {
  const output = runVueTsc();
  refuseUnreadable(output);
  const current = countByFile(parseVueTscOutput(output));
  if (process.argv.includes("--update")) {
    const refusal = refuseBaselineUpdate(
      current,
      readBaseline(),
      process.argv.includes("--allow-empty"),
    );
    if (refusal !== null) {
      throw new Error(refusal);
    }
    writeFileSync(
      BASELINE_PATH,
      `${JSON.stringify(buildBaseline(current, NOTE), null, 2)}\n`,
    );
    process.stdout.write(`${BASELINE_PATH} を更新しました。\n`);
    return;
  }
  const report = renderRatchetReport(
    compareToBaseline(current, requireBaseline()),
    UPDATE_COMMAND,
  );
  process.stdout.write(`${report.text}\n`);
  if (!report.ok) {
    process.exitCode = 1;
  }
};

main();
