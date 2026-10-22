import { describe, it } from "node:test";
import assert from "node:assert";

import { shouldEnforceAppCheck } from "../../src/wrappers/firebase";

// App Check を外してよいのはエミュレーターの中だけ。ここが緩むと、本番の
// Callable が誰からでも呼べるようになる。既定は「効かせる」側に倒す。

describe("shouldEnforceAppCheck", () => {
  it("印が無ければ効かせる", () => {
    assert.strictEqual(shouldEnforceAppCheck({}), true);
  });

  it("エミュレーターの中でだけ外す", () => {
    assert.strictEqual(
      shouldEnforceAppCheck({ FUNCTIONS_EMULATOR: "true" }),
      false,
    );
  });

  // "true" 以外は本番と同じ扱い。紛らわしい値で緩まないこと。
  it("紛らわしい値では外さない", () => {
    ["TRUE", "1", "yes", "", "false", " true"].forEach((value) => {
      assert.strictEqual(
        shouldEnforceAppCheck({ FUNCTIONS_EMULATOR: value }),
        true,
        `${JSON.stringify(value)} で外れた`,
      );
    });
  });
});
