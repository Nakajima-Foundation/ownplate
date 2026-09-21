import { describe, it } from "node:test";
import assert from "node:assert";

import {
  describeSendResult,
  detectPlatform,
} from "../../src/utils/pushFormat.ts";

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

describe("describeSendResult", () => {
  it("says so when nothing is registered", () => {
    assert.strictEqual(describeSendResult(0, 0), "no registered devices");
  });

  it("reports the delivered fraction", () => {
    assert.strictEqual(describeSendResult(2, 3), "sent 2/3");
  });
});
