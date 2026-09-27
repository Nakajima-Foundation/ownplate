import { describe, it } from "node:test";
import assert from "node:assert";

import {
  addDays,
  addMinutes,
  dateKeyOf,
  formatDay,
  minutesOfDay,
  startOfDayAfter,
  weekdayOf,
} from "../../src/utils/shopCalendar.ts";

// 受取日時に関わる暦の計算。いまは端末のローカル時刻で数えるので、試験の日付もローカル時刻で
// 組み立てる（日本でも UTC の CI でも同じ日になる）。

const at = (month: number, day: number, hour = 0, minute = 0) =>
  new Date(2026, month - 1, day, hour, minute, 30, 250);

describe("startOfDayAfter", () => {
  it("is midnight of the same day for offset zero", () => {
    assert.strictEqual(
      startOfDayAfter(at(9, 24, 15, 45), 0).getTime(),
      new Date(2026, 8, 24).getTime(),
    );
  });

  it("counts days forward and backward, across months and years", () => {
    assert.strictEqual(
      startOfDayAfter(at(9, 30, 10), 1).getTime(),
      new Date(2026, 9, 1).getTime(),
    );
    assert.strictEqual(
      startOfDayAfter(at(12, 31, 23, 59), 1).getTime(),
      new Date(2027, 0, 1).getTime(),
    );
    assert.strictEqual(
      startOfDayAfter(at(3, 1, 0, 1), -1).getTime(),
      new Date(2026, 1, 28).getTime(),
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
