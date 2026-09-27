import { describe, it } from "node:test";
import assert from "node:assert";

import { openNowByDay } from "../../src/utils/shopOpen.ts";

// 店舗情報の営業時間の一覧で、今日の行に「Open」を出すかどうか。
// 日付はローカル時刻で組み立てる（実装は端末の暦で読む）。

const H = 60;
const EVERY_DAY = ["1", "2", "3", "4", "5", "6", "7"];
const businessEveryDay = Object.fromEntries(
  EVERY_DAY.map((day) => [day, true]),
);
const hours8to20 = Object.fromEntries(
  EVERY_DAY.map((day) => [day, [{ start: 8 * H, end: 20 * H }]]),
);

// 2026-09-27 は日曜、28 は月曜、26 は土曜。
const sundayAt = (hour: number, minute = 0) =>
  new Date(2026, 8, 27, hour, minute);
const mondayAt = (hour: number, minute = 0) =>
  new Date(2026, 8, 28, hour, minute);

const openDays = (result: { [day: string]: boolean }) =>
  Object.keys(result).filter((day) => result[day]);

describe("openNowByDay", () => {
  // 日曜は営業時間のキーでは "7"、曜日では 0。以前はここが合わずに常に false だった。
  it("marks Sunday open during Sunday's hours", () => {
    assert.deepStrictEqual(
      openDays(openNowByDay(businessEveryDay, hours8to20, sundayAt(14, 20))),
      ["7"],
    );
  });

  it("marks Monday open during Monday's hours", () => {
    assert.deepStrictEqual(
      openDays(openNowByDay(businessEveryDay, hours8to20, mondayAt(14, 20))),
      ["1"],
    );
  });

  it("marks only today, even when every day has the same hours", () => {
    [0, 1, 2, 3, 4, 5, 6].forEach((daysAfterSunday) => {
      const now = new Date(2026, 8, 27 + daysAfterSunday, 12);
      const expected = daysAfterSunday === 0 ? "7" : String(daysAfterSunday);
      assert.deepStrictEqual(
        openDays(openNowByDay(businessEveryDay, hours8to20, now)),
        [expected],
      );
    });
  });

  it("marks nothing outside today's hours", () => {
    assert.deepStrictEqual(
      openDays(openNowByDay(businessEveryDay, hours8to20, sundayAt(7, 59))),
      [],
    );
    assert.deepStrictEqual(
      openDays(openNowByDay(businessEveryDay, hours8to20, sundayAt(20, 1))),
      [],
    );
  });

  it("counts the opening and closing minutes as open", () => {
    assert.deepStrictEqual(
      openDays(openNowByDay(businessEveryDay, hours8to20, sundayAt(8, 0))),
      ["7"],
    );
    assert.deepStrictEqual(
      openDays(openNowByDay(businessEveryDay, hours8to20, sundayAt(20, 0))),
      ["7"],
    );
  });

  it("marks open inside any one of several spans, and not between them", () => {
    const twoSpans = {
      ...hours8to20,
      "7": [
        { start: 6 * H + 30, end: 10 * H + 30 },
        { start: 15 * H, end: 23 * H + 30 },
      ],
    };
    assert.deepStrictEqual(
      openDays(openNowByDay(businessEveryDay, twoSpans, sundayAt(9))),
      ["7"],
    );
    assert.deepStrictEqual(
      openDays(openNowByDay(businessEveryDay, twoSpans, sundayAt(14, 19))),
      [],
    );
    assert.deepStrictEqual(
      openDays(openNowByDay(businessEveryDay, twoSpans, sundayAt(16))),
      ["7"],
    );
  });

  it("marks nothing on a day the shop does not open", () => {
    const closedSunday = { ...businessEveryDay, "7": false };
    assert.deepStrictEqual(
      openDays(openNowByDay(closedSunday, hours8to20, sundayAt(14))),
      [],
    );
  });

  // 営業しない曜日は営業時間を持たないことがある。今日でなければ読まない。
  it("does not read the hours of other days", () => {
    const onlySunday = { "7": [{ start: 8 * H, end: 20 * H }] };
    assert.deepStrictEqual(
      openDays(openNowByDay(businessEveryDay, onlySunday, sundayAt(14))),
      ["7"],
    );
  });

  it("lists every day of the week", () => {
    assert.deepStrictEqual(
      Object.keys(openNowByDay({}, {}, sundayAt(14))).sort(),
      EVERY_DAY,
    );
  });
});
