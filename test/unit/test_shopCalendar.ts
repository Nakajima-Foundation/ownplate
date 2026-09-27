import { describe, it } from "node:test";
import assert from "node:assert";

import {
  addDays,
  pickupDateOf,
  addMinutes,
  dateKeyOf,
  formatDay,
  minutesOfDay,
  startOfDayAfter,
  startOfDayOfKey,
  startOfMonthAfter,
  weekdayOf,
} from "../../src/utils/shopCalendar.ts";
import { shopTime } from "../helpers/shopTime.ts";

// 受取日時に関わる暦の計算。店の時刻（JST）で数えるので、試験の日付も JST で組み立てる。
// どのタイムゾーンで走らせても同じ結果になる。

const at = (month: number, day: number, hour = 0, minute = 0) =>
  shopTime(2026, month, day, hour, minute, 30, 250);

describe("startOfDayAfter", () => {
  it("is midnight of the same day for offset zero", () => {
    assert.strictEqual(
      startOfDayAfter(at(9, 24, 15, 45), 0).getTime(),
      shopTime(2026, 9, 24).getTime(),
    );
  });

  it("counts days forward and backward, across months and years", () => {
    assert.strictEqual(
      startOfDayAfter(at(9, 30, 10), 1).getTime(),
      shopTime(2026, 10, 1).getTime(),
    );
    assert.strictEqual(
      startOfDayAfter(at(12, 31, 23, 59), 1).getTime(),
      shopTime(2027, 1, 1).getTime(),
    );
    assert.strictEqual(
      startOfDayAfter(at(3, 1, 0, 1), -1).getTime(),
      shopTime(2026, 2, 28).getTime(),
    );
  });

  it("does not change the date it is given", () => {
    const now = at(9, 24, 15, 45);
    const before = now.getTime();
    startOfDayAfter(now, 3);
    assert.strictEqual(now.getTime(), before);
  });
});

describe("weekdayOf", () => {
  // 2026-09-27 は日曜。
  it("counts Sunday as zero", () => {
    assert.strictEqual(weekdayOf(at(9, 27)), 0);
    assert.strictEqual(weekdayOf(at(9, 26, 23, 59)), 6);
  });
});

describe("minutesOfDay", () => {
  it("is the minutes since midnight, ignoring seconds", () => {
    assert.strictEqual(minutesOfDay(at(9, 24, 0, 0)), 0);
    assert.strictEqual(minutesOfDay(at(9, 24, 11, 5)), 11 * 60 + 5);
    assert.strictEqual(minutesOfDay(at(9, 24, 23, 59)), 23 * 60 + 59);
  });
});

describe("addMinutes / addDays", () => {
  it("moves past midnight into the next day", () => {
    assert.strictEqual(
      addMinutes(at(9, 24, 23, 50), 25).getTime(),
      at(9, 25, 0, 15).getTime(),
    );
  });

  it("moves across the end of a month", () => {
    assert.strictEqual(
      addDays(at(9, 30, 11), 2).getTime(),
      at(10, 2, 11).getTime(),
    );
  });

  it("does not change the date it is given", () => {
    const date = at(9, 24, 11);
    const before = date.getTime();
    addMinutes(date, 90);
    addDays(date, 7);
    assert.strictEqual(date.getTime(), before);
  });
});

describe("formatDay / dateKeyOf", () => {
  it("writes the date with zero padding", () => {
    assert.strictEqual(dateKeyOf(at(1, 5, 23, 59)), "2026-01-05");
    assert.strictEqual(formatDay(at(1, 5), "YYYY/MM/DD"), "2026/01/05");
  });

  it("writes the day the date falls on, not the next one, late at night", () => {
    assert.strictEqual(dateKeyOf(at(12, 31, 23, 59)), "2026-12-31");
  });
});

describe("pickupDateOf", () => {
  // 注文停止画面は受け取れる日が無いとき「今」を起点にするので、秒以下が残る。
  it("keeps the seconds of the day it starts from", () => {
    assert.strictEqual(
      pickupDateOf(at(9, 24, 10, 5), 90).getTime(),
      shopTime(2026, 9, 24, 1, 30, 30, 250).getTime(),
    );
  });
});

describe("startOfMonthAfter", () => {
  it("is the first day of the month at midnight (JST)", () => {
    assert.strictEqual(
      startOfMonthAfter(at(9, 24, 15, 45), 0).getTime(),
      shopTime(2026, 9, 1).getTime(),
    );
  });

  it("counts months backward and forward, across years", () => {
    assert.strictEqual(
      startOfMonthAfter(at(9, 24), -1).getTime(),
      shopTime(2026, 8, 1).getTime(),
    );
    assert.strictEqual(
      startOfMonthAfter(at(9, 24), -9).getTime(),
      shopTime(2025, 12, 1).getTime(),
    );
    assert.strictEqual(
      startOfMonthAfter(at(9, 24), 4).getTime(),
      shopTime(2027, 1, 1).getTime(),
    );
  });

  // JST では 10/1 に入っているが、UTC やロサンゼルスではまだ 9/30。
  it("uses the JST month, not the month on the device", () => {
    assert.strictEqual(
      startOfMonthAfter(shopTime(2026, 10, 1, 0, 30), 0).getTime(),
      shopTime(2026, 10, 1).getTime(),
    );
  });
});

describe("startOfDayOfKey", () => {
  it("is midnight (JST) of the day the key names", () => {
    assert.strictEqual(
      startOfDayOfKey("2026-09-27").getTime(),
      shopTime(2026, 9, 27).getTime(),
    );
  });

  it("round-trips with dateKeyOf", () => {
    ["2026-01-01", "2026-12-31", "2024-02-29", "2050-06-15"].forEach((key) =>
      assert.strictEqual(dateKeyOf(startOfDayOfKey(key)), key),
    );
  });
});
