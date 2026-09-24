import { appendFileSync, readFileSync } from "node:fs";
import { parseLcov, renderCoverageMarkdown } from "./lcovSummary.ts";

const [lcovPath, title = "Coverage"] = process.argv.slice(2);

const readLcov = (path: string) => {
  try {
    return readFileSync(path, "utf8");
  } catch (error) {
    throw new Error(`cannot read lcov file: ${path}`, { cause: error });
  }
};

const main = () => {
  if (!lcovPath)
    throw new Error(
      "usage: node scripts/coverage-summary.ts <lcov.info> [title]",
    );
  const markdown = renderCoverageMarkdown(
    title,
    parseLcov(readLcov(lcovPath), process.cwd()),
  );
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) {
    appendFileSync(summaryPath, markdown);
  } else {
    process.stdout.write(markdown);
  }
};

main();
