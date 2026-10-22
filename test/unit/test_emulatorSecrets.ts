import { describe, it } from "node:test";
import assert from "node:assert";
import { readFileSync } from "node:fs";

import {
  SECRET_FILE_MARKER,
  collectSecretNames,
  renderSecretFile,
  writtenByUs,
} from "../../scripts/emulatorSecrets.ts";

// 秘密が一つでも欠けると、エミュレーターはその一つのために Secret Manager へ行く。
// 手元は認証が効いていて本物が降りてくるので、欠けたことは CI が赤くなるまで
// 分からない。ここで実物の一覧と突き合わせる。

const wrapperSource = readFileSync(
  new URL("../../functions/src/wrappers/firebase.ts", import.meta.url),
  "utf8",
);

describe("エミュレーターへ渡す偽の秘密", () => {
  // 突き合わせる相手は、別の読み方で数えたもの。同じ正規表現で数えたものと
  // 比べても、取りこぼしは両方に等しく出るので何も言えない。
  const byLine = (source: string): string[] => {
    const lines = source.split("\n");
    const start = lines.findIndex((line) =>
      line.includes("export const secretKeys = ["),
    );
    const end = lines.findIndex(
      (line, index) => index > start && line === "];",
    );
    assert.ok(start >= 0 && end > start, "secretKeys の並びが見つからない");
    return lines
      .slice(start + 1, end)
      .map((line) => /"([A-Z0-9_]+)"/.exec(line))
      .filter((matched) => matched !== null)
      .map((matched) => matched[1]);
  };

  it("実物の secretKeys をすべて拾う", () => {
    assert.deepStrictEqual(
      collectSecretNames(wrapperSource),
      byLine(wrapperSource),
    );
  });

  it("並びが読めなければ止まる", () => {
    assert.throws(() => collectSecretNames("export const other = [];"));
  });

  it("値は空にしない", () => {
    const rendered = renderSecretFile(["A", "B"]);
    rendered
      .split("\n")
      .filter((line) => line.includes("="))
      .forEach((line) => assert.ok(line.split("=")[1].length > 0, line));
  });

  it("印のある綴りだけを自分のものと見る", () => {
    assert.ok(writtenByUs(renderSecretFile(["A"])));
    assert.ok(!writtenByUs("STRIPE_SECRET=real\n"));
    assert.ok(!writtenByUs(`x${SECRET_FILE_MARKER}\n`));
  });
});
