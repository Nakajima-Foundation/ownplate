import { describe, it } from "node:test";
import assert from "node:assert";

import { isJapaneseHoliday } from "../../src/utils/holiday.ts";
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
