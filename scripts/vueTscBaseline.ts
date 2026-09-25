import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

import {
  buildBaseline,
  compareToBaseline,
  countByFile,
  describeAbnormalExit,
  findUnreadableErrorLines,
  parseVueTscOutput,
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

const readBaseline = (): Baseline => {
  try {
    return JSON.parse(readFileSync(BASELINE_PATH, "utf8"));
  } catch (error) {
    throw new Error(`${BASELINE_PATH} を読めませんでした`, { cause: error });
  }
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
    writeFileSync(
      BASELINE_PATH,
      `${JSON.stringify(buildBaseline(current, NOTE), null, 2)}\n`,
    );
    process.stdout.write(`${BASELINE_PATH} を更新しました。\n`);
    return;
  }
  const report = renderRatchetReport(
    compareToBaseline(current, readBaseline()),
    UPDATE_COMMAND,
  );
  process.stdout.write(`${report.text}\n`);
  if (!report.ok) {
    process.exitCode = 1;
  }
};

main();
