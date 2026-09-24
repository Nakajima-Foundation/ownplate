import { describe, it } from "node:test";
import assert from "node:assert";
import {
  STALE_CHUNK_RELOAD_COOLDOWN_MS,
  STALE_CHUNK_RELOADED_AT_KEY,
  claimStaleChunkReload,
  parseReloadedAt,
  sameOriginReloadUrl,
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

// 開き直す先は移動先のパス。パスの書き方しだいでブラウザは別のサイトを開くので、同じオリジンに限る。
describe("sameOriginReloadUrl", () => {
  const ORIGIN = "https://omochikaeri.com";

  it("opens the destination on the same site", () => {
    assert.strictEqual(
      sameOriginReloadUrl(
        "/admin/restaurants/abc/orders?day=2026-09-24",
        ORIGIN,
      ),
      `${ORIGIN}/admin/restaurants/abc/orders?day=2026-09-24`,
    );
    assert.strictEqual(
      sameOriginReloadUrl("/r/abc#menu", ORIGIN),
      `${ORIGIN}/r/abc#menu`,
    );
    assert.strictEqual(
      sameOriginReloadUrl("/ok?next=//evil.example", ORIGIN),
      `${ORIGIN}/ok?next=//evil.example`,
    );
  });

  it("refuses a path the browser would open on another site", () => {
    [
      "//evil.example/x",
      "///evil.example/x",
      "/\\evil.example/x",
      "\\\\evil.example/x",
      "https://evil.example/x",
      "javascript:alert(1)",
      "http://omochikaeri.com/x",
    ].forEach((fullPath) => {
      assert.strictEqual(sameOriginReloadUrl(fullPath, ORIGIN), null, fullPath);
    });
  });
});

// 記録が読めない・書けないのに開き直すと、分割ファイルが本当に無いときに読み込み直しが止まらない。
describe("claimStaleChunkReload", () => {
  const memoryStorage = (initial: { [key: string]: string } = {}) => {
    const items = new Map(Object.entries(initial));
    return {
      items,
      getItem: (key: string) => items.get(key) ?? null,
      setItem: (key: string, value: string) => {
        items.set(key, value);
      },
    };
  };
  const failing = () => {
    throw new Error("storage is disabled");
  };

  it("claims the first reload and records when it happened", () => {
    const storage = memoryStorage();
    assert.strictEqual(claimStaleChunkReload(storage, NOW_MS), true);
    assert.strictEqual(
      storage.items.get(STALE_CHUNK_RELOADED_AT_KEY),
      String(NOW_MS),
    );
  });

  it("refuses a second reload inside the cooldown and keeps the first record", () => {
    const storage = memoryStorage({
      [STALE_CHUNK_RELOADED_AT_KEY]: String(NOW_MS),
    });
    assert.strictEqual(claimStaleChunkReload(storage, NOW_MS + 1), false);
    assert.strictEqual(
      storage.items.get(STALE_CHUNK_RELOADED_AT_KEY),
      String(NOW_MS),
    );
  });

  it("refuses when the record cannot be read", () => {
    const storage = { ...memoryStorage(), getItem: failing };
    assert.strictEqual(claimStaleChunkReload(storage, NOW_MS), false);
  });

  it("refuses when the record cannot be written", () => {
    const storage = { ...memoryStorage(), setItem: failing };
    assert.strictEqual(claimStaleChunkReload(storage, NOW_MS), false);
  });
});
