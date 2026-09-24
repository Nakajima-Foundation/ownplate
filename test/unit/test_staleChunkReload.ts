import { describe, it } from "node:test";
import assert from "node:assert";
import {
  STALE_CHUNK_RELOAD_COOLDOWN_MS,
  parseReloadedAt,
  shouldReloadForStaleChunk,
} from "../../src/utils/staleChunkReload.ts";

// デプロイ後に古い画面が消えた分割ファイルを読んだら、一度だけ開き直す。
// 開き直した直後にまた失敗するなら分割ファイルが本当に無いので、繰り返してはいけない。
const NOW_MS = 1_790_000_000_000;

describe("shouldReloadForStaleChunk", () => {
  it("reloads when nothing was reloaded before", () => {
    assert.strictEqual(shouldReloadForStaleChunk(null, NOW_MS), true);
  });

  it("does not reload again right after a reload", () => {
    assert.strictEqual(shouldReloadForStaleChunk(NOW_MS, NOW_MS), false);
    assert.strictEqual(
      shouldReloadForStaleChunk(
        NOW_MS - STALE_CHUNK_RELOAD_COOLDOWN_MS + 1,
        NOW_MS,
      ),
      false,
    );
  });

  it("reloads again once the cooldown has passed", () => {
    assert.strictEqual(
      shouldReloadForStaleChunk(
        NOW_MS - STALE_CHUNK_RELOAD_COOLDOWN_MS,
        NOW_MS,
      ),
      true,
    );
    assert.strictEqual(shouldReloadForStaleChunk(0, NOW_MS), true);
  });

  // 前回の記録が未来にあるのは時計が戻ったとき。当てにすると、戻った分だけ開き直せない。
  it("ignores a reload recorded in the future", () => {
    assert.strictEqual(shouldReloadForStaleChunk(NOW_MS + 1, NOW_MS), true);
  });
});

describe("parseReloadedAt", () => {
  it("reads the stored time", () => {
    assert.strictEqual(parseReloadedAt(String(NOW_MS)), NOW_MS);
    assert.strictEqual(parseReloadedAt("0"), 0);
  });

  it("treats a missing or empty value as never reloaded", () => {
    assert.strictEqual(parseReloadedAt(null), null);
    assert.strictEqual(parseReloadedAt(""), null);
    assert.strictEqual(parseReloadedAt("   "), null);
  });

  it("treats a value that is not a number as never reloaded", () => {
    ["abc", "NaN", "Infinity", "-Infinity", "12ab", "{}"].forEach((raw) => {
      assert.strictEqual(parseReloadedAt(raw), null, raw);
    });
  });
});
