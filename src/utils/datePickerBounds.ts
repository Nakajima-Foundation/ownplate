import moment from "moment";

// 日付ピッカーの選べる範囲。minDate を渡さないときの下限は now（当日）。
// 2020 年の Buefy 版では min-date / max-date で決めていたが、2025 年に
// 手書きへ移したとき上限が落ちていた。規則をここに置いて試験できるようにする。

export const isDateDisabled = (
  day: Date,
  now: Date,
  minDate?: Date,
  maxDate?: Date,
): boolean => {
  if (moment(day).isBefore(moment(minDate ?? now), "day")) {
    return true;
  }
  if (maxDate && moment(day).isAfter(moment(maxDate), "day")) {
    return true;
  }
  return false;
};

// DateTimePicker 用。こちらは下限を暗黙に補わない — 渡された範囲だけを見る。
// 割引の有効期間のように、過去に始まっている期間も扱うため。
export const isDateOutOfRange = (
  day: Date,
  minDate?: Date,
  maxDate?: Date,
): boolean => {
  if (minDate && moment(day).isBefore(moment(minDate), "day")) {
    return true;
  }
  if (maxDate && moment(day).isAfter(moment(maxDate), "day")) {
    return true;
  }
  return false;
};

export const isPrevMonthOutOfRange = (
  month: Date,
  now: Date,
  minDate?: Date,
): boolean =>
  moment(month)
    .startOf("month")
    .isSameOrBefore(moment(minDate ?? now).startOf("month"));

export const isNextMonthOutOfRange = (month: Date, maxDate?: Date): boolean =>
  maxDate
    ? moment(month)
        .startOf("month")
        .isSameOrAfter(moment(maxDate).startOf("month"))
    : false;
