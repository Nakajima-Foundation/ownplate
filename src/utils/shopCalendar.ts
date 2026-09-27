import moment from "moment";

// 受取日時に関わる暦の計算。日付・曜日・時刻はここを通して数える。
// 店のある日本の時刻（JST）で数える。端末のタイムゾーンには合わせない（omochikaeri-docs#229）。
// JST は UTC+9 固定で夏時間が無いので、時刻を 9 時間ずらして UTC として読めば JST の暦になる。

export const SHOP_TIME_ZONE = "Asia/Tokyo";
const SHOP_OFFSET_MINUTES = 9 * 60;
const MS_PER_MINUTE = 60 * 1000;
const MS_PER_DAY = 24 * 60 * MS_PER_MINUTE;
const SHOP_OFFSET_MS = SHOP_OFFSET_MINUTES * MS_PER_MINUTE;

// JST の暦を UTC の暦として読める日時。
const shopClockOf = (date: Date) => new Date(date.getTime() + SHOP_OFFSET_MS);

// JST の年月日時分（月は 0 始まり）から、その瞬間の Date。範囲外は Date.UTC と同じく繰り上がる。
const fromShopClock = (
  year: number,
  month: number,
  day: number,
  minutes = 0,
  seconds = 0,
  ms = 0,
) =>
  new Date(
    Date.UTC(year, month, day, 0, minutes, seconds, ms) - SHOP_OFFSET_MS,
  );

// now の日から offsetDays 日後の 0 時（JST）。
export const startOfDayAfter = (now: Date, offsetDays: number): Date => {
  const clock = shopClockOf(now);
  return fromShopClock(
    clock.getUTCFullYear(),
    clock.getUTCMonth(),
    clock.getUTCDate() + offsetDays,
  );
};

// now の月から offsetMonths か月後の 1 日 0 時（JST）。
export const startOfMonthAfter = (now: Date, offsetMonths: number): Date => {
  const clock = shopClockOf(now);
  return fromShopClock(
    clock.getUTCFullYear(),
    clock.getUTCMonth() + offsetMonths,
    1,
  );
};

// 日曜が 0（JST の曜日）。
export const weekdayOf = (date: Date): number => shopClockOf(date).getUTCDay();

// 0 時からの分（JST）。
export const minutesOfDay = (date: Date): number => {
  const clock = shopClockOf(date);
  return clock.getUTCHours() * 60 + clock.getUTCMinutes();
};

// JST には夏時間が無いので、分も日も一定の長さで足せる。
export const addMinutes = (date: Date, minutes: number): Date =>
  new Date(date.getTime() + minutes * MS_PER_MINUTE);

export const addDays = (date: Date, days: number): Date =>
  new Date(date.getTime() + days * MS_PER_DAY);

// 受取日（その日の 0 時）に 0 時からの分数を足した日時。秒以下は受取日の値を残す。
export const pickupDateOf = (day: Date, minutesFromMidnight: number): Date => {
  const clock = shopClockOf(day);
  return fromShopClock(
    clock.getUTCFullYear(),
    clock.getUTCMonth(),
    clock.getUTCDate(),
    minutesFromMidnight,
    clock.getUTCSeconds(),
    clock.getUTCMilliseconds(),
  );
};

// moment の書式で JST の日付を書く（曜日名は moment に設定した言語で出る）。
export const formatDay = (date: Date, pattern: string): string =>
  moment(date).utcOffset(SHOP_OFFSET_MINUTES).format(pattern);

export const dateKeyOf = (date: Date): string => formatDay(date, "YYYY-MM-DD");
