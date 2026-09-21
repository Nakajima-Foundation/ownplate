import { describe, it } from "node:test";
import assert from "node:assert";

import { resetRegistrationState } from "../../src/utils/pushReset.ts";

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
