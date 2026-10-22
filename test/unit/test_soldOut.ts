import { describe, it } from "node:test";
import assert from "node:assert";

import { isSoldOutOn, soldOutTodayKeyOf } from "../../src/utils/soldOut.ts";
import { shopTime } from "../helpers/shopTime.ts";

// 「本日売り切れ」は売り切れにした日（JST の YYYY-MM-DD）を持ち、今日と同じ日なら売り切れ。
// 今日は店の時刻（JST）で決まる。受取日の一覧と同じ暦でないと、海外の端末で食い違う。

describe("isSoldOutOn", () => {
  it("is sold out on the day it was marked", () => {
    assert.strictEqual(
      isSoldOutOn("2026-09-27", shopTime(2026, 9, 27, 14)),
      true,
    );
  });

  it("is available again the next day", () => {
    assert.strictEqual(
      isSoldOutOn("2026-09-27", shopTime(2026, 9, 28, 0)),
      false,
    );
  });

  it("counts the whole JST day, up to the last millisecond", () => {
    assert.strictEqual(
      isSoldOutOn("2026-09-27", shopTime(2026, 9, 27, 23, 59, 59, 999)),
      true,
    );
    assert.strictEqual(isSoldOutOn("2026-09-27", shopTime(2026, 9, 27)), true);
  });

  // 日本時間 9/28 1:00 は、UTC では 9/27 16:00、ロサンゼルスでは 9/27 9:00。
  // どの端末でも「今日」は 9/28。
  it("uses the JST day, not the day on the device", () => {
    const earlyJstMorning = shopTime(2026, 9, 28, 1);
    assert.strictEqual(isSoldOutOn("2026-09-28", earlyJstMorning), true);
    assert.strictEqual(isSoldOutOn("2026-09-27", earlyJstMorning), false);
  });

  it("is not sold out when nothing was marked", () => {
    const now = shopTime(2026, 9, 27, 14);
    assert.strictEqual(isSoldOutOn(undefined, now), false);
    assert.strictEqual(isSoldOutOn(null, now), false);
    assert.strictEqual(isSoldOutOn("", now), false);
  });

  it("does not match a date written in another format", () => {
    assert.strictEqual(
      isSoldOutOn("2026/09/27", shopTime(2026, 9, 27, 14)),
      false,
    );
  });
});

describe("soldOutTodayKeyOf", () => {
  it("writes today in JST as YYYY-MM-DD", () => {
    assert.strictEqual(
      soldOutTodayKeyOf(shopTime(2026, 1, 5, 23, 59)),
      "2026-01-05",
    );
    assert.strictEqual(
      soldOutTodayKeyOf(shopTime(2026, 9, 28, 1)),
      "2026-09-28",
    );
  });

  it("reads back as sold out on the same day", () => {
    const now = shopTime(2026, 9, 27, 14);
    assert.strictEqual(isSoldOutOn(soldOutTodayKeyOf(now), now), true);
  });
});
