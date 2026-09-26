import { describe, it } from "node:test";
import assert from "node:assert";

import { asDate } from "../../src/utils/dateUtils.ts";

// 同じ属性が、読む時点によって Timestamp だったり Date だったりする
// （画面が上書きして変換しているため。ownplate#1981）。どちらが来ても Date にする。
describe("asDate", () => {
  const at = new Date("2026-09-26T01:23:45.000Z");

  // Date はそのまま返す。**作り直さない** — 作り直すと、同じ物かどうかで
  // 分岐している場所の意味が変わる。
  it("gives back the very same Date object", () => {
    const result = asDate(at);
    assert.strictEqual(result, at);
  });

  // Timestamp は toDate() の結果。firebase を読み込まずに済むよう形だけで受ける。
  it("converts anything that carries toDate", () => {
    const timestampLike = { toDate: () => at, seconds: 0, nanoseconds: 0 };
    assert.strictEqual(asDate(timestampLike), at);
  });

  // 変換済みの物をもう一度通しても壊れない。移行の途中で二重に通っても同じ。
  it("is safe to apply twice", () => {
    assert.strictEqual(asDate(asDate(at)), at);
    assert.strictEqual(asDate(asDate({ toDate: () => at })), at);
  });

  // Date の派生は Date として扱う（instanceof が真になる）。
  it("treats a subclass of Date as a Date", () => {
    class Special extends Date {}
    const special = new Special(at.getTime());
    assert.strictEqual(asDate(special), special);
  });
});
