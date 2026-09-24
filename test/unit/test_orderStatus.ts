import { describe, it } from "node:test";
import assert from "node:assert";

import { order_status, orderStatusOf } from "../../src/config/constant.ts";

// 名前から注文の状態を引く。`Object.keys()` から回すので、知らない名前も来うる。
describe("orderStatusOf", () => {
  it("gives the value for every name in the list", () => {
    Object.entries(order_status).forEach(([name, value]) => {
      assert.strictEqual(orderStatusOf(name), value);
    });
  });

  it("gives undefined for a name that is not in the list", () => {
    assert.strictEqual(orderStatusOf("unknown"), undefined);
    assert.strictEqual(orderStatusOf(""), undefined);
  });

  // 素の索きだと継承した関数が返り、宣言した戻り値の型が嘘になる。
  it("does not reach names that every object inherits", () => {
    ["toString", "constructor", "hasOwnProperty", "valueOf", "__proto__"].forEach(
      (name) => {
        assert.strictEqual(orderStatusOf(name), undefined, name);
      },
    );
  });
});
