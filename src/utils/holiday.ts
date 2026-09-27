import holiday_jp from "@holiday-jp/holiday_jp";

import { dateKeyOf, formatDay } from "./shopCalendar";

// 日本の祝日。祝日のデータはパッケージ（@holiday-jp/holiday_jp）だけが持ち、ここで毎回読む。
// どこにも写さず保存もしないので、パッケージを更新すれば画面もサーバもそのまま新しい祝日になる。
// 日付は店の時刻（JST）の年月日で読む。持っている祝日の範囲を過ぎた日は祝日にならない。

export type JapaneseHoliday = {
  // YYYY-MM-DD（JST）
  dateKey: string;
  name: string;
  nameEn: string;
};

type HolidayRecord = { date: string; name: string; name_en: string };
const holidays: Record<string, HolidayRecord> = holiday_jp.holidays;

export const isJapaneseHoliday = (date: Date): boolean =>
  holiday_jp.isHoliday(dateKeyOf(date));

// fromKey から toKey まで（両端を含む、YYYY-MM-DD）の祝日を日付の順に。
export const holidaysBetweenKeys = (
  fromKey: string,
  toKey: string,
): JapaneseHoliday[] =>
  Object.values(holidays)
    .filter((holiday) => holiday.date >= fromKey && holiday.date <= toKey)
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .map((holiday) => ({
      dateKey: holiday.date,
      name: holiday.name,
      nameEn: holiday.name_en,
    }));

// 今日（JST）から翌年の年末までの祝日。店舗設定で「祝日定休」の対象を見せるのに使う。
export const holidaysThroughNextYear = (now: Date): JapaneseHoliday[] => {
  const nextYear = Number(formatDay(now, "YYYY")) + 1;
  return holidaysBetweenKeys(dateKeyOf(now), `${nextYear}-12-31`);
};
