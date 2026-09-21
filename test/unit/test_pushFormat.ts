import { describe, it } from "node:test";
import assert from "node:assert";

import type { PushDevice } from "../../src/utils/pushFormat.ts";
import {
  asPlatform,
  describeSendResult,
  detectPlatform,
  isBlockedByBrowser,
  isPushEnabledHere,
  sortDevices,
} from "../../src/utils/pushFormat.ts";

const device = (fid: string, updatedAtMs: number | null): PushDevice => ({
  fid,
  platform: "other",
  updatedAtMs,
});

describe("detectPlatform", () => {
  it("detects iOS devices", () => {
    assert.strictEqual(detectPlatform("iPhone; CPU iPhone OS 17_4"), "ios");
    assert.strictEqual(detectPlatform("iPad; CPU OS 16_4"), "ios");
    assert.strictEqual(detectPlatform("iPod touch"), "ios");
  });

  it("detects Android", () => {
    assert.strictEqual(detectPlatform("Linux; Android 14; Pixel 8"), "android");
  });

  it("falls back to other", () => {
    assert.strictEqual(detectPlatform("Macintosh; Intel Mac OS X"), "other");
    assert.strictEqual(detectPlatform(""), "other");
  });
});

describe("asPlatform", () => {
  it("passes through known values", () => {
    assert.strictEqual(asPlatform("ios"), "ios");
    assert.strictEqual(asPlatform("android"), "android");
  });

  it("maps anything unexpected to other", () => {
    [undefined, null, 42, "windows", {}].forEach((value) => {
      assert.strictEqual(asPlatform(value), "other");
    });
  });
});

describe("sortDevices", () => {
  it("puts the most recently used device first", () => {
    const sorted = sortDevices([
      device("a", 100),
      device("b", 300),
      device("c", 200),
    ]);
    assert.deepStrictEqual(
      sorted.map((d) => d.fid),
      ["b", "c", "a"],
    );
  });

  it("sorts devices with no timestamp last", () => {
    const sorted = sortDevices([device("a", null), device("b", 1)]);
    assert.deepStrictEqual(
      sorted.map((d) => d.fid),
      ["b", "a"],
    );
  });

  it("breaks ties by fid so the order cannot flicker", () => {
    const sorted = sortDevices([device("b", 1), device("a", 1)]);
    assert.deepStrictEqual(
      sorted.map((d) => d.fid),
      ["a", "b"],
    );
  });

  it("does not mutate the input", () => {
    const input = [device("b", 1), device("a", 2)];
    sortDevices(input);
    assert.deepStrictEqual(
      input.map((d) => d.fid),
      ["b", "a"],
    );
  });
});

describe("isPushEnabledHere", () => {
  const devices = [device("me", 1), device("other", 2)];

  it("is true only when registered AND permitted", () => {
    assert.strictEqual(isPushEnabledHere(devices, "me", "granted"), true);
  });

  it("is false when the browser permission was revoked", () => {
    assert.strictEqual(isPushEnabledHere(devices, "me", "denied"), false);
    assert.strictEqual(isPushEnabledHere(devices, "me", "default"), false);
  });

  it("is false when this device is not registered", () => {
    assert.strictEqual(isPushEnabledHere(devices, "unknown", "granted"), false);
  });

  it("is false when the installation id could not be read", () => {
    assert.strictEqual(isPushEnabledHere(devices, "", "granted"), false);
  });
});

describe("isBlockedByBrowser", () => {
  it("is true only for an explicit denial", () => {
    assert.strictEqual(isBlockedByBrowser("denied"), true);
    assert.strictEqual(isBlockedByBrowser("granted"), false);
    assert.strictEqual(isBlockedByBrowser("default"), false);
  });
});

describe("describeSendResult", () => {
  it("says so when nothing is registered", () => {
    assert.strictEqual(describeSendResult(0, 0), "no registered devices");
  });

  it("reports the delivered fraction", () => {
    assert.strictEqual(describeSendResult(2, 3), "sent 2/3");
  });
});
