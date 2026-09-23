import { describe, it } from "node:test";
import assert from "node:assert";
import { roundPrice } from "../../src/utils/price.ts";

// 通貨の最小単位に丸める。請求書・レシート・カートの金額がこれを通る。
// 日本円は最小単位が 1 なので、小数が残らない。
describe("roundPrice", () => {
  it("rounds to whole yen", () => {
    assert.strictEqual(roundPrice(100.4), 100);
    assert.strictEqual(roundPrice(100.5), 101);
    assert.strictEqual(roundPrice(100.6), 101);
  });

  it("leaves a whole amount alone", () => {
    assert.strictEqual(roundPrice(100), 100);
    assert.strictEqual(roundPrice(0), 0);
  });

  // 値引きのオプションは負の金額になる。Math.round は -0.5 を 0 側へ寄せるので、
  // 正の側と対称ではない。請求額に出る値なので、どちらに寄るかを留めておく。
  it("rounds a negative amount towards zero at the half", () => {
    assert.strictEqual(roundPrice(-100.5), -100);
    assert.strictEqual(roundPrice(-100.6), -101);
    assert.strictEqual(roundPrice(-100.4), -100);
  });

  it("always gives back a number, never a string", () => {
    [0, 1, -1, 0.5, 1234.567].forEach((price) => {
      assert.strictEqual(typeof roundPrice(price), "number");
    });
  });
});
