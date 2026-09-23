import { describe, it } from "node:test";
import assert from "node:assert";
import {
  formatDateYMD,
  midNight,
  midNightOfMonth,
} from "../../src/utils/dateUtils.ts";

// 注文の集計期間。ここがずれると、店主が見る売上の範囲が1日ずれる。
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

describe("formatDateYMD", () => {
  it("writes the date the way a spreadsheet sorts it", () => {
    assert.strictEqual(formatDateYMD(new Date(2026, 8, 23)), "2026-09-23");
  });

  // 月は0始まりなので、+1 を落とすと全部1か月ずれる。
  it("counts January as the first month, not the zeroth", () => {
    assert.strictEqual(formatDateYMD(new Date(2026, 0, 1)), "2026-01-01");
    assert.strictEqual(formatDateYMD(new Date(2026, 11, 31)), "2026-12-31");
  });

  // ゼロ詰めを落とすと 2026-9-3 になり、文字列として並べたときに順が崩れる。
  it("pads the month and the day to two digits", () => {
    assert.strictEqual(formatDateYMD(new Date(2026, 8, 3)), "2026-09-03");
    assert.strictEqual(formatDateYMD(new Date(2026, 0, 9)), "2026-01-09");
  });

  it("reads the local date, not the one in UTC", () => {
    const localNoon = new Date(2026, 8, 23, 12, 0, 0);
    assert.strictEqual(formatDateYMD(localNoon), "2026-09-23");
  });

  it("keeps the year as written, including one outside this century", () => {
    assert.strictEqual(formatDateYMD(new Date(1999, 11, 31)), "1999-12-31");
  });
});

// 集計の起点。時刻が残っていると、その日の早い時間の注文が範囲から落ちる。
describe("midNight", () => {
  const isMidnight = (date: Date) =>
    date.getHours() === 0 &&
    date.getMinutes() === 0 &&
    date.getSeconds() === 0 &&
    date.getMilliseconds() === 0;

  it("clears the time of day", () => {
    assert.ok(isMidnight(midNight()));
  });

  it("clears the time of day however far it is shifted", () => {
    [-30, -1, 0, 1, 30].forEach((delta) => {
      assert.ok(isMidnight(midNight(delta)), `delta=${delta}`);
    });
  });

  it("means today when nothing is asked for", () => {
    assert.strictEqual(formatDateYMD(midNight()), formatDateYMD(new Date()));
  });

  it("shifts by whole days, forwards and backwards", () => {
    const today = midNight();
    assert.strictEqual(
      midNight(1).getTime() - today.getTime(),
      MILLISECONDS_PER_DAY,
    );
    assert.strictEqual(
      today.getTime() - midNight(-1).getTime(),
      MILLISECONDS_PER_DAY,
    );
  });

  // 月末や年末を跨いでも日付として正しく繰り上がる。日数の足し算で済ませると崩れる。
  it("crosses the end of a month and of a year as a date, not as a number", () => {
    const today = midNight();
    const inAYear = midNight(365);
    assert.ok(isMidnight(inAYear));
    assert.strictEqual(
      Math.round((inAYear.getTime() - today.getTime()) / MILLISECONDS_PER_DAY),
      365,
    );
  });
});

// 月次の集計の起点。1日に寄せてから月を動かすので、月末に実行しても月が飛ばない。
describe("midNightOfMonth", () => {
  it("lands on the first of the month at midnight", () => {
    [-13, -1, 0, 1, 13].forEach((delta) => {
      const start = midNightOfMonth(delta);
      assert.strictEqual(start.getDate(), 1, `delta=${delta}`);
      assert.strictEqual(start.getHours(), 0);
      assert.strictEqual(start.getMinutes(), 0);
      assert.strictEqual(start.getSeconds(), 0);
      assert.strictEqual(start.getMilliseconds(), 0);
    });
  });

  it("means this month when nothing is asked for", () => {
    const now = new Date();
    const start = midNightOfMonth();
    assert.strictEqual(start.getFullYear(), now.getFullYear());
    assert.strictEqual(start.getMonth(), now.getMonth());
  });

  // 月を1つ動かしたら、飛ばさずに隣の月になる。先に1日へ寄せていないと、
  // 31日に実行したときに31日の無い月を飛び越す。
  //
  // この検査が赤くなるのは、実行した日が移動先の月に存在しない日（29〜31日）のときだけ。
  // それ以外の日は寄せる順を入れ替えても結果が同じで、本当に無動作になる。
  // 常に捕まえるには midNightOfMonth が現在時刻を引数で受け取る必要がある。
  it("moves to the neighbouring month without skipping one", () => {
    const monthsSince = (date: Date) =>
      date.getFullYear() * 12 + date.getMonth();
    const thisMonth = monthsSince(midNightOfMonth());
    assert.strictEqual(monthsSince(midNightOfMonth(-1)), thisMonth - 1);
    assert.strictEqual(monthsSince(midNightOfMonth(1)), thisMonth + 1);
    assert.strictEqual(monthsSince(midNightOfMonth(-12)), thisMonth - 12);
  });

  it("crosses the turn of the year", () => {
    const monthsSince = (date: Date) =>
      date.getFullYear() * 12 + date.getMonth();
    const thisMonth = monthsSince(midNightOfMonth());
    [-18, -13, 13, 18].forEach((delta) => {
      assert.strictEqual(
        monthsSince(midNightOfMonth(delta)),
        thisMonth + delta,
      );
    });
  });

  it("starts no later than midNight of the same day it lands on", () => {
    const start = midNightOfMonth();
    assert.strictEqual(start.getTime() <= midNight().getTime(), true);
  });
});
