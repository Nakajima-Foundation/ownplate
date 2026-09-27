import moment from "moment";

// 受取日時に関わる暦の計算。日付・曜日・時刻はここを通して数える。
// いまは端末のローカル時刻で数えている（omochikaeri-docs#229 で JST に切り替える）。

// now の日から offsetDays 日後の 0 時。
export const startOfDayAfter = (now: Date, offsetDays: number): Date => {
  const date = new Date(now);
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  date.setDate(date.getDate() + offsetDays);
  return date;
};

// 日曜が 0。
export const weekdayOf = (date: Date): number => date.getDay();

// 0 時からの分。
export const minutesOfDay = (date: Date): number =>
  date.getHours() * 60 + date.getMinutes();

export const addMinutes = (date: Date, minutes: number): Date => {
  const moved = new Date(date);
  moved.setMinutes(date.getMinutes() + minutes);
  return moved;
};

export const addDays = (date: Date, days: number): Date => {
  const moved = new Date(date);
  moved.setDate(moved.getDate() + days);
  return moved;
};

// 受取日（その日の 0 時）に 0 時からの分数を足した日時。受取日の一覧の Date は画面が表示に使い回すので、書き換えずに複製する。
export const pickupDateOf = (day: Date, minutesFromMidnight: number): Date => {
  const pickupDate = new Date(day);
  pickupDate.setHours(minutesFromMidnight / 60);
  pickupDate.setMinutes(minutesFromMidnight % 60);
  return pickupDate;
};

// moment の書式で日付を書く（曜日名は moment に設定した言語で出る）。
export const formatDay = (date: Date, pattern: string): string =>
  moment(date).format(pattern);

export const dateKeyOf = (date: Date): string => formatDay(date, "YYYY-MM-DD");
