import { describe, it } from "node:test";
import assert from "node:assert";

import {
  describeSendResult,
  detectPlatform,
  hasRecentFailure,
  lastSend,
  MAX_DEVICE_NAME_LENGTH,
  needsReregistration,
  recentFailureCode,
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

describe("hasRecentFailure", () => {
  const ok = (at: number) => ({ at, ok: true });
  const ng = (at: number) => ({ at, ok: false, code: "messaging/x" });

  it("says nothing when there is no history at all", () => {
    assert.strictEqual(hasRecentFailure(undefined), false);
    assert.strictEqual(hasRecentFailure([]), false);
  });

  it("says nothing while every recent send succeeded", () => {
    assert.strictEqual(hasRecentFailure([ok(3), ok(2), ok(1)]), false);
  });

  it("alerts on a failure anywhere inside the window", () => {
    assert.strictEqual(hasRecentFailure([ng(3), ok(2), ok(1)]), true);
    assert.strictEqual(hasRecentFailure([ok(3), ng(2), ok(1)]), true);
    assert.strictEqual(hasRecentFailure([ok(3), ok(2), ng(1)]), true);
  });

  // 窓の外に落ちた失敗は、その後の送信が通っているということなので出さない
  it("stops alerting once the failure falls outside the window", () => {
    assert.strictEqual(hasRecentFailure([ok(4), ok(3), ok(2), ng(1)]), false);
  });

  it("works on a history shorter than the window", () => {
    assert.strictEqual(hasRecentFailure([ng(1)]), true);
    assert.strictEqual(hasRecentFailure([ok(1)]), false);
  });
});

describe("lastSend", () => {
  it("returns the newest record, which is the first", () => {
    assert.deepStrictEqual(
      lastSend([
        { at: 2, ok: true },
        { at: 1, ok: false },
      ]),
      {
        at: 2,
        ok: true,
      },
    );
  });

  it("returns nothing for a device that has never been sent to", () => {
    assert.strictEqual(lastSend(undefined), null);
    assert.strictEqual(lastSend([]), null);
  });
});

describe("needsReregistration", () => {
  const ok = (at: number) => ({ at, ok: true });
  const deadTarget = (at: number) => ({
    at,
    ok: false,
    code: "messaging/installation-id-not-registered",
    dead: true,
  });
  // payload 不正など。再登録しても直らない。
  const otherFailure = (at: number) => ({
    at,
    ok: false,
    code: "messaging/invalid-argument",
  });

  it("asks for re-registration only when the target itself is dead", () => {
    assert.strictEqual(needsReregistration([deadTarget(1)]), true);
    assert.strictEqual(needsReregistration([otherFailure(1)]), false);
  });

  // 「失敗している」と「登録し直せば直る」は別。ここが同じだと、直らない作業をさせる。
  it("is not the same thing as having a recent failure", () => {
    const history = [otherFailure(1)];
    assert.strictEqual(hasRecentFailure(history), true);
    assert.strictEqual(needsReregistration(history), false);
  });

  it("says nothing for a healthy or unknown device", () => {
    assert.strictEqual(needsReregistration([ok(1)]), false);
    assert.strictEqual(needsReregistration(undefined), false);
    assert.strictEqual(needsReregistration([]), false);
  });

  it("stops asking once the dead result falls outside the window", () => {
    assert.strictEqual(
      needsReregistration([ok(4), ok(3), ok(2), deadTarget(1)]),
      false,
    );
  });
});

describe("recentFailureCode", () => {
  it("reports the newest failing code inside the window", () => {
    assert.strictEqual(
      recentFailureCode([
        { at: 3, ok: false, code: "messaging/second" },
        { at: 2, ok: false, code: "messaging/first" },
      ]),
      "messaging/second",
    );
  });

  it("skips successes to find the failure", () => {
    assert.strictEqual(
      recentFailureCode([
        { at: 2, ok: true },
        { at: 1, ok: false, code: "x" },
      ]),
      "x",
    );
  });

  it("returns nothing when there is no failure to report", () => {
    assert.strictEqual(recentFailureCode([{ at: 1, ok: true }]), "");
    assert.strictEqual(recentFailureCode(undefined), "");
  });
});

// 入力欄の上限と、サーバが実際に詰める長さ。片方だけ動かすと、入力できた名前が
// 保存時に黙って切られる（または短く制限されたまま気づけない）。
describe("MAX_DEVICE_NAME_LENGTH", () => {
  it("matches the length the server truncates to", async () => {
    const server =
      await import("../../functions/src/functions/notify/pushInviteFormat.ts");
    assert.strictEqual(MAX_DEVICE_NAME_LENGTH, server.MAX_DEVICE_NAME_LENGTH);
  });
});
