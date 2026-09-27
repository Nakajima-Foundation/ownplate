import holiday_jp from "@holiday-jp/holiday_jp";

import { dateKeyOf } from "./shopCalendar";

// 日付は受取日の一覧と同じ暦（shopCalendar）で読む。
// 持っている祝日は 1970〜2050 年。それより先の日は祝日にならない。
export const isJapaneseHoliday = (date: Date): boolean =>
  holiday_jp.isHoliday(dateKeyOf(date));
