import { describe, it } from "node:test";
import assert from "node:assert";

import {
  describeSendResult,
  detectPlatform,
  registeredAtSeconds,
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

describe("registeredAtSeconds", () => {
  it("prefers the registration time when it is there", () => {
    assert.strictEqual(
      registeredAtSeconds({ seconds: 100 }, { seconds: 200 }),
      100,
    );
  });

  // registeredAt は後から足したので、それ以前の登録には無い。updatedAt は
  // 引き換え時にしか書かれていないので、そちらが登録日時になる。
  it("falls back for a device registered before the field existed", () => {
    assert.strictEqual(registeredAtSeconds(undefined, { seconds: 200 }), 200);
    assert.strictEqual(registeredAtSeconds(null, { seconds: 200 }), 200);
  });

  // serverTimestamp() は書き込み直後のローカルスナップショットでは null になる
  it("returns nothing rather than throwing when neither has landed", () => {
    assert.strictEqual(registeredAtSeconds(null, null), null);
    assert.strictEqual(registeredAtSeconds(undefined, undefined), null);
  });

  it("keeps a zero timestamp rather than treating it as missing", () => {
    assert.strictEqual(
      registeredAtSeconds({ seconds: 0 }, { seconds: 200 }),
      0,
    );
  });
});
