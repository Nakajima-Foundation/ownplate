import { describe, it } from "node:test";
import assert from "node:assert";
import { isReturnedOAuthState } from "../../src/utils/oauthState.ts";

// Stripe 連携の戻りで、送り出した state と同じものが返ってきたかを見る。
// ここが緩いと、他人が取った認可コードを踏ませるだけで受け取り口座を差し替えられる。
describe("isReturnedOAuthState", () => {
  it("accepts the state that was saved when the owner left for Stripe", () => {
    assert.strictEqual(isReturnedOAuthState("s0.123", "s0.123"), true);
  });

  it("rejects a return with no state and no saved cookie", () => {
    assert.strictEqual(isReturnedOAuthState(undefined, undefined), false);
  });

  it("rejects a return when the cookie has expired or was never set", () => {
    assert.strictEqual(isReturnedOAuthState("s0.123", undefined), false);
  });

  it("rejects a return that carries no state", () => {
    assert.strictEqual(isReturnedOAuthState(undefined, "s0.123"), false);
    assert.strictEqual(isReturnedOAuthState(null, "s0.123"), false);
  });

  it("rejects an empty state on both sides", () => {
    assert.strictEqual(isReturnedOAuthState("", ""), false);
  });

  it("rejects a different state", () => {
    assert.strictEqual(isReturnedOAuthState("s0.999", "s0.123"), false);
  });

  // vue-router は ?state=a&state=b を配列で渡す。
  it("rejects a repeated state parameter", () => {
    assert.strictEqual(isReturnedOAuthState(["s0.123"], "s0.123"), false);
    assert.strictEqual(
      isReturnedOAuthState(["s0.123", "s0.123"], "s0.123"),
      false,
    );
  });
});
