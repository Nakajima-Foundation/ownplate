import { describe, it } from "node:test";
import assert from "node:assert";

import {
  holidaysBetweenKeys,
  holidaysThroughNextYear,
  isJapaneseHoliday,
} from "../../src/utils/holiday.ts";
import { dateKeyOf, startOfDayOfKey } from "../../src/utils/shopCalendar.ts";
import { shopTime } from "../helpers/shopTime.ts";

// 受取日が祝日かどうか。平日限定の商品を祝日に出さないために使う。
// 日付は店の時刻（JST）で組み立てる（実装が JST の暦で読むので、どのタイムゾーンで走らせても同じ日になる）。
const dayOf = (year: number, month: number, day: number, hour = 0) =>
  shopTime(year, month, day, hour);

describe("isJapaneseHoliday", () => {
  it("knows fixed-date holidays", () => {
    assert.strictEqual(isJapaneseHoliday(dayOf(2026, 1, 1)), true); // 元日
    assert.strictEqual(isJapaneseHoliday(dayOf(2026, 5, 3)), true); // 憲法記念日
    assert.strictEqual(isJapaneseHoliday(dayOf(2026, 11, 3)), true); // 文化の日
  });

  it("knows holidays that move to a Monday", () => {
    assert.strictEqual(isJapaneseHoliday(dayOf(2026, 1, 12)), true); // 成人の日
    assert.strictEqual(isJapaneseHoliday(dayOf(2026, 9, 21)), true); // 敬老の日
  });

  // 祝日が日曜に重なると、次の平日が休みになる。
  it("counts a substitute holiday", () => {
    assert.strictEqual(isJapaneseHoliday(dayOf(2025, 5, 6)), true);
  });

  // 祝日に挟まれた平日も休みになる（2026 年の敬老の日と秋分の日の間）。
  it("counts a day sandwiched between two holidays", () => {
    assert.strictEqual(isJapaneseHoliday(dayOf(2026, 9, 22)), true);
  });

  // 年によって日が動いた祝日。2020 年はオリンピックで海の日・スポーツの日・山の日が移った。
  it("follows the year-specific dates, not a fixed rule", () => {
    assert.strictEqual(isJapaneseHoliday(dayOf(2020, 7, 23)), true);
    assert.strictEqual(isJapaneseHoliday(dayOf(2020, 7, 24)), true);
    assert.strictEqual(isJapaneseHoliday(dayOf(2020, 8, 10)), true);
    assert.strictEqual(isJapaneseHoliday(dayOf(2020, 10, 12)), false);
  });

  it("is false on an ordinary weekday", () => {
    assert.strictEqual(isJapaneseHoliday(dayOf(2026, 9, 24)), false);
  });

  // 土日は祝日ではない。曜日の判定は別にある。
  it("is false on a weekend that is not a holiday", () => {
    assert.strictEqual(isJapaneseHoliday(dayOf(2026, 9, 26)), false);
    assert.strictEqual(isJapaneseHoliday(dayOf(2026, 9, 27)), false);
  });

  // 受取時刻を載せた日時でも、日付だけで決まる。
  it("decides by the date alone, whatever the time of day", () => {
    [0, 12, 23].forEach((hour) => {
      assert.strictEqual(isJapaneseHoliday(dayOf(2026, 1, 1, hour)), true);
      assert.strictEqual(isJapaneseHoliday(dayOf(2025, 12, 31, hour)), false);
    });
    assert.strictEqual(
      isJapaneseHoliday(shopTime(2026, 1, 1, 23, 59, 59, 999)),
      true,
    );
    assert.strictEqual(isJapaneseHoliday(shopTime(2026, 1, 2)), false);
  });

  it("sees the whole year of holidays, from the first to the last", () => {
    assert.strictEqual(isJapaneseHoliday(dayOf(2026, 12, 31)), false);
    assert.strictEqual(isJapaneseHoliday(dayOf(2026, 12, 23)), false); // 天皇誕生日は 2 月に移った
    assert.strictEqual(isJapaneseHoliday(dayOf(2026, 2, 23)), true);
  });

  // 持っている祝日は 2050 年まで。それより先は祝日を知らないので false になる。
  it("knows no holidays after the data it ships with", () => {
    assert.strictEqual(isJapaneseHoliday(dayOf(2050, 1, 1)), true);
    assert.strictEqual(isJapaneseHoliday(dayOf(2051, 1, 1)), false);
  });

  it("is false for an invalid date instead of throwing", () => {
    assert.strictEqual(isJapaneseHoliday(new Date(Number.NaN)), false);
  });
});

// 祝日の一覧。パッケージを更新しても壊れないよう、日付を固定するのは過ぎた年だけにして、
// これから先の分は「範囲に収まる・順に並ぶ・判定と食い違わない」という性質で見る。
describe("holidaysBetweenKeys", () => {
  it("lists the holidays in a past range, both ends included", () => {
    assert.deepStrictEqual(
      holidaysBetweenKeys("2025-05-03", "2025-05-06").map((h) => h.dateKey),
      ["2025-05-03", "2025-05-04", "2025-05-05", "2025-05-06"],
    );
  });

  it("carries a name in Japanese and in English", () => {
    const [newYear] = holidaysBetweenKeys("2025-01-01", "2025-01-01");
    assert.strictEqual(newYear.name, "元日");
    assert.ok(newYear.nameEn.length > 0);
  });

  it("is empty for a range with no holidays, or a reversed range", () => {
    assert.deepStrictEqual(holidaysBetweenKeys("2025-06-01", "2025-06-30"), []);
    assert.deepStrictEqual(holidaysBetweenKeys("2025-05-06", "2025-05-03"), []);
  });

  it("agrees with isJapaneseHoliday on every day it lists", () => {
    const listed = holidaysBetweenKeys("1970-01-01", "9999-12-31");
    assert.ok(listed.length > 0);
    listed.forEach((holiday) =>
      assert.strictEqual(
        isJapaneseHoliday(startOfDayOfKey(holiday.dateKey)),
        true,
        holiday.dateKey,
      ),
    );
  });

  it("lists days in order without repeats", () => {
    const keys = holidaysBetweenKeys("1970-01-01", "9999-12-31").map(
      (h) => h.dateKey,
    );
    assert.deepStrictEqual(keys, [...new Set(keys)].sort());
  });
});

describe("holidaysThroughNextYear", () => {
  // 日本時間 2026-09-27 12:00。端末のタイムゾーンによらず今日は 9/27、翌年末は 2027-12-31。
  const now = shopTime(2026, 9, 27, 12);

  it("lists from today through the end of next year", () => {
    const listed = holidaysThroughNextYear(now);
    assert.ok(listed.length > 0);
    listed.forEach((holiday) => {
      assert.ok(holiday.dateKey >= dateKeyOf(now), holiday.dateKey);
      assert.ok(holiday.dateKey <= "2027-12-31", holiday.dateKey);
    });
  });

  it("is exactly the holidays in that range", () => {
    assert.deepStrictEqual(
      holidaysThroughNextYear(now),
      holidaysBetweenKeys("2026-09-27", "2027-12-31"),
    );
  });

  // 日本時間では 1/1 だが、UTC やロサンゼルスではまだ 12/31。年は JST で決める。
  it("decides this year and today by JST", () => {
    const newYearMorning = shopTime(2027, 1, 1, 1);
    const listed = holidaysThroughNextYear(newYearMorning);
    assert.strictEqual(listed[0]?.dateKey, "2027-01-01");
    assert.ok(listed.every((holiday) => holiday.dateKey <= "2028-12-31"));
    assert.ok(listed.some((holiday) => holiday.dateKey >= "2028-01-01"));
  });
});
