import holiday_jp from "@holiday-jp/holiday_jp";

// 日付は端末の暦（ローカル時刻の年月日）で読む。受取日の一覧も同じ暦で作っているので揃う。
// 持っている祝日は 1970〜2050 年。それより先の日は祝日にならない。
export const isJapaneseHoliday = (date: Date): boolean =>
  holiday_jp.isHoliday(date);
