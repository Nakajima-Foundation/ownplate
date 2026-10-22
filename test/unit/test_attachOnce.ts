import { describe, it } from "node:test";
import assert from "node:assert";

import { attachOnce } from "../../src/utils/attachOnce.ts";

describe("attachOnce", () => {
  it("runs the first time", () => {
    const once = attachOnce();
    let calls = 0;
    assert.strictEqual(
      once(() => {
        calls += 1;
      }),
      true,
    );
    assert.strictEqual(calls, 1);
  });

  // 本題。二度目を通すと、1件の push に通知が2つ出る。
  it("does nothing the second time", () => {
    const once = attachOnce();
    let calls = 0;
    const attach = () => {
      calls += 1;
    };
    once(attach);
    assert.strictEqual(once(attach), false);
    assert.strictEqual(once(attach), false);
    assert.strictEqual(calls, 1);
  });

  it("latches even when the first attach throws", () => {
    const once = attachOnce();
    let calls = 0;
    assert.throws(() =>
      once(() => {
        calls += 1;
        throw new Error("the SDK refused");
      }),
    );
    assert.strictEqual(
      once(() => {
        calls += 1;
      }),
      false,
    );
    assert.strictEqual(calls, 1);
  });

  it("keeps separate latches apart", () => {
    const first = attachOnce();
    const second = attachOnce();
    first(() => {});
    assert.strictEqual(
      second(() => {}),
      true,
    );
  });
});
