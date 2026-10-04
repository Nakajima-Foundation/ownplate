import { describe, it } from "node:test";
import assert from "node:assert";

import { runIsolated } from "../../src/functions/notify/isolate";

const record = () => {
  const calls: string[] = [];
  return { calls, note: (name: string) => calls.push(name) };
};

const ok = (name: string, log: string[]) => ({
  name,
  run: async () => {
    log.push(name);
  },
});

const boom = (
  name: string,
  log: string[],
  error: unknown = new Error(name),
) => ({
  name,
  run: async () => {
    log.push(name);
    throw error;
  },
});

describe("runIsolated", () => {
  it("runs every task and reports them done", async () => {
    const log: string[] = [];
    const errors = record();
    const result = await runIsolated(
      [ok("line", log), ok("mail", log), ok("push", log)],
      errors.note,
    );
    assert.deepStrictEqual(result, {
      done: ["line", "mail", "push"],
      failed: [],
    });
    assert.deepStrictEqual(errors.calls, []);
  });

  // 本題。先頭が落ちても残りを止めない。
  it("keeps going when the first task throws", async () => {
    const log: string[] = [];
    const errors = record();
    const result = await runIsolated(
      [boom("line", log), ok("mail", log), ok("push", log)],
      errors.note,
    );
    assert.deepStrictEqual(log, ["line", "mail", "push"]);
    assert.deepStrictEqual(result.done, ["mail", "push"]);
    assert.deepStrictEqual(result.failed, ["line"]);
    assert.deepStrictEqual(errors.calls, ["line"]);
  });

  it("never rejects, however many tasks throw", async () => {
    const log: string[] = [];
    const errors = record();
    const result = await runIsolated(
      [boom("line", log), boom("mail", log), boom("push", log)],
      errors.note,
    );
    assert.deepStrictEqual(result.failed, ["line", "mail", "push"]);
    assert.deepStrictEqual(result.done, []);
  });

  it("keeps the order it was given", async () => {
    const log: string[] = [];
    await runIsolated(
      [ok("a", log), ok("b", log), ok("c", log), ok("d", log)],
      () => {},
    );
    assert.deepStrictEqual(log, ["a", "b", "c", "d"]);
  });

  // 一つずつ待つ。並列にすると送信の順序が変わる。
  it("waits for each task before starting the next", async () => {
    const log: string[] = [];
    const slow = {
      name: "slow",
      run: async () => {
        await new Promise((resolve) => setTimeout(resolve, 20));
        log.push("slow");
      },
    };
    await runIsolated([slow, ok("fast", log)], () => {});
    assert.deepStrictEqual(log, ["slow", "fast"]);
  });

  it("hands the error itself to the reporter", async () => {
    const log: string[] = [];
    const thrown = new Error("line is down");
    const seen: unknown[] = [];
    await runIsolated([boom("line", log, thrown)], (_name, error) => {
      seen.push(error);
    });
    assert.strictEqual(seen[0], thrown);
  });

  // 文字列を投げるものもある。Error でなくても止まらないこと。
  it("survives a task that throws something that is not an Error", async () => {
    const log: string[] = [];
    const result = await runIsolated(
      [boom("line", log, "just a string")],
      () => {},
    );
    assert.deepStrictEqual(result.failed, ["line"]);
  });

  it("returns empty for no tasks", async () => {
    const result = await runIsolated([], () => {});
    assert.deepStrictEqual(result, { done: [], failed: [] });
  });
});
