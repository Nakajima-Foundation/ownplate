import { describe, it } from "node:test";
import assert from "node:assert";
import { readFileSync } from "node:fs";

// 祝日の判定は画面（ルート）とサーバ（functions）がそれぞれ入れたパッケージで行う。
// 片方だけ更新すると、同じ日を画面とサーバで違って判定する。指定も入っている版も揃える。
const PACKAGE = "@holiday-jp/holiday_jp";

type PackageJson = { dependencies?: { [name: string]: string } };
const isPackageJson = (value: unknown): value is PackageJson =>
  typeof value === "object" && value !== null;

const rangeIn = (path: string) => {
  const parsed: unknown = JSON.parse(readFileSync(path, "utf8"));
  assert.ok(isPackageJson(parsed), path);
  return parsed.dependencies?.[PACKAGE];
};

// yarn.lock の `"@holiday-jp/holiday_jp@^x":\n  version "x.y.z"` から入っている版を読む。
const lockedVersionIn = (path: string) => {
  const lock = readFileSync(path, "utf8");
  const entry = lock
    .split("\n\n")
    .find((block) => block.includes(`${PACKAGE}@`));
  return entry?.match(/\n\s+version "([^"]+)"/)?.[1];
};

describe("holiday package", () => {
  it("is required with the same range at the root and in functions", () => {
    const root = rangeIn("package.json");
    assert.ok(root);
    assert.strictEqual(rangeIn("functions/package.json"), root);
  });

  it("is locked to the same version at the root and in functions", () => {
    const root = lockedVersionIn("yarn.lock");
    assert.ok(root);
    assert.strictEqual(lockedVersionIn("functions/yarn.lock"), root);
  });
});
