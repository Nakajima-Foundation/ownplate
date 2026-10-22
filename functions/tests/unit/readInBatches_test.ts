import { describe, it } from "node:test";
import assert from "node:assert";

import { readInBatches } from "../../src/lib/readInBatches";

// 読んだ順と、同時に走っていた数を記録する読み手。
const recorder = () => {
  const started: number[] = [];
  const state = { running: 0, maxRunning: 0 };
  const read = async (item: number) => {
    started.push(item);
    state.running += 1;
    state.maxRunning = Math.max(state.maxRunning, state.running);
    await new Promise((resolve) => setTimeout(resolve, 1));
    state.running -= 1;
    return [item * 10, item * 10 + 1];
  };
  return { started, state, read };
};

describe("readInBatches", () => {
  it("reads every item, keeps order, and flattens the results", async () => {
    const { read } = recorder();
    assert.deepStrictEqual(await readInBatches([1, 2, 3], 2, read), [10, 11, 20, 21, 30, 31]);
  });

  it("never runs more than size reads at once", async () => {
    const { read, state } = recorder();
    await readInBatches([1, 2, 3, 4, 5, 6, 7], 3, read);
    assert.strictEqual(state.maxRunning, 3);
  });

  it("stops starting new batches once done says so", async () => {
    const { read, started } = recorder();
    const result = await readInBatches([1, 2, 3, 4, 5], 2, read, (sofar) => sofar.length >= 4);
    assert.deepStrictEqual(started, [1, 2]);
    assert.deepStrictEqual(result, [10, 11, 20, 21]);
  });

  it("handles no items", async () => {
    const { read, started } = recorder();
    assert.deepStrictEqual(await readInBatches([], 3, read), []);
    assert.deepStrictEqual(started, []);
  });

  it("propagates a failed read", async () => {
    await assert.rejects(
      readInBatches([1, 2], 1, async (item) => {
        if (item === 2) {
          throw new Error("boom");
        }
        return [item];
      }),
      /boom/,
    );
  });
});
