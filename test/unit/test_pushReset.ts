import { describe, it } from "node:test";
import assert from "node:assert";

import {
  resetRegistrationState,
  settleWithin,
} from "../../src/utils/pushReset.ts";

const recorder = () => {
  const calls: string[] = [];
  const failures: unknown[] = [];
  return {
    calls,
    failures,
    onFailure: (reason: unknown) => failures.push(reason),
  };
};

describe("resetRegistrationState", () => {
  it("runs both steps", async () => {
    const r = recorder();
    await resetRegistrationState({
      dropSubscription: async () => r.calls.push("drop"),
      rotateInstallation: async () => r.calls.push("rotate"),
      onFailure: r.onFailure,
    });
    assert.deepStrictEqual([...r.calls].sort(), ["drop", "rotate"]);
    assert.strictEqual(r.failures.length, 0);
  });

  // 直列に繋ぐと、購読削除が失敗した端末で回転がスキップされ、register() が
  // キャッシュ経路に入って登録が死んだままになる。両方試されることが要件。
  it("still rotates when dropping the subscription rejects", async () => {
    const r = recorder();
    await resetRegistrationState({
      dropSubscription: () => Promise.reject(new Error("drop failed")),
      rotateInstallation: async () => r.calls.push("rotate"),
      onFailure: r.onFailure,
    });
    assert.deepStrictEqual(r.calls, ["rotate"]);
    assert.strictEqual(r.failures.length, 1);
  });

  it("still drops the subscription when rotating rejects", async () => {
    const r = recorder();
    await resetRegistrationState({
      dropSubscription: async () => r.calls.push("drop"),
      rotateInstallation: () => Promise.reject(new Error("rotate failed")),
      onFailure: r.onFailure,
    });
    assert.deepStrictEqual(r.calls, ["drop"]);
    assert.strictEqual(r.failures.length, 1);
  });

  // promise を返す前に同期的に throw する SDK ガードがあると、そのままでは
  // allSettled の外に抜けてもう片方まで巻き込んで落ちる。
  it("survives a step that throws synchronously", async () => {
    const r = recorder();
    await resetRegistrationState({
      dropSubscription: () => {
        throw new Error("sync throw");
      },
      rotateInstallation: async () => r.calls.push("rotate"),
      onFailure: r.onFailure,
    });
    assert.deepStrictEqual(r.calls, ["rotate"]);
    assert.strictEqual(r.failures.length, 1);
  });

  it("never rejects even when both steps fail", async () => {
    const r = recorder();
    await resetRegistrationState({
      dropSubscription: () => Promise.reject(new Error("a")),
      rotateInstallation: () => Promise.reject(new Error("b")),
      onFailure: r.onFailure,
    });
    assert.strictEqual(r.failures.length, 2);
  });
});

describe("settleWithin", () => {
  // 予約されたコールバックを呼ばずに捨てることで「上限にまだ達していない」状態を作る
  const never = () => undefined;
  const flush = () => new Promise((resolve) => setImmediate(resolve));

  it("returns as soon as the work resolves, without waiting for the bound", async () => {
    await settleWithin(Promise.resolve("done"), 1000, never);
  });

  it("returns when the work rejects, and does not reject itself", async () => {
    await settleWithin(Promise.reject(new Error("boom")), 1000, never);
  });

  it("waits for the bound when the work never settles", async () => {
    let fire = () => undefined as void;
    let requested_ms = 0;
    let settled = false;
    const waiting = settleWithin(
      new Promise(() => undefined),
      1500,
      (callback, ms) => {
        fire = callback;
        requested_ms = ms;
      },
    ).then(() => {
      settled = true;
    });

    await flush();
    assert.strictEqual(settled, false);
    assert.strictEqual(requested_ms, 1500);

    fire();
    await waiting;
    assert.strictEqual(settled, true);
  });

  it("resolves to nothing, so callers cannot branch on the outcome", async () => {
    assert.strictEqual(
      await settleWithin(Promise.resolve("value"), 1000, never),
      undefined,
    );
  });
});
