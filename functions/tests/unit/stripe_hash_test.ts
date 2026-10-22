import { describe, it } from "node:test";
import assert from "node:assert";

import { getHash } from "../../src/functions/stripe/intent";

// Stripe の冪等キーの素。同じ操作をやり直したときに同じ鍵にならないと、
// 二重に課金される。逆に別の操作が同じ鍵になると、2件目が黙って捨てられる。
describe("getHash", () => {
  it("gives the same key for the same operation", () => {
    assert.strictEqual(getHash("order1-pi_123"), getHash("order1-pi_123"));
  });

  it("gives a different key for a different operation", () => {
    assert.notStrictEqual(getHash("order1-pi_123"), getHash("order2-pi_123"));
    assert.notStrictEqual(getHash("order1-pi_123"), getHash("order1-pi_124"));
  });

  // 実装を別のアルゴリズムに替えると、再デプロイをまたいだやり直しが別の鍵になる。
  // 期待値は shasum -a 256 と openssl dgst -sha256 で別に計算したもの:
  //   printf '%s' 'order1-pi_123' | shasum -a 256
  it("stays on the algorithm already deployed", () => {
    assert.strictEqual(getHash("order1-pi_123"), "ce12bf1d7f55ce4f5c29c4d0cce60db6b6fdefd141806fe5b7816d62745c8298");
  });

  it("produces a key Stripe will accept", () => {
    const key = getHash("order1-pi_123");
    assert.match(key, /^[0-9a-f]{64}$/);
    assert.ok(key.length <= 255);
  });
});
