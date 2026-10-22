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

// パッケージの 1 件分。更新で形が変わっても黙って壊れないよう、読むときに確かめる。
type HolidayRecord = { date: string; name: string; name_en?: unknown };
const isHolidayRecord = (value: unknown): value is HolidayRecord =>
  typeof value === "object" &&
  value !== null &&
  "date" in value &&
  typeof value.date === "string" &&
  "name" in value &&
  typeof value.name === "string";

const isRecord = (value: unknown): value is { [key: string]: unknown } =>
  typeof value === "object" && value !== null;

// パッケージの 1 件を読む。形が合わなければ null（その件だけ落とす）。
// 英語名が無い（項目名が変わった）ときは日本語名を出す。
export const japaneseHolidayOf = (value: unknown): JapaneseHoliday | null =>
  isHolidayRecord(value)
    ? {
        dateKey: value.date,
        name: value.name,
        nameEn: typeof value.name_en === "string" ? value.name_en : value.name,
      }
    : null;

const isJapaneseHolidayValue = (
  value: JapaneseHoliday | null,
): value is JapaneseHoliday => value !== null;

const allHolidays = (): JapaneseHoliday[] => {
  const holidays: unknown = holiday_jp.holidays;
  return isRecord(holidays)
    ? Object.values(holidays)
        .map(japaneseHolidayOf)
        .filter(isJapaneseHolidayValue)
    : [];
};

export const isJapaneseHoliday = (date: Date): boolean =>
  holiday_jp.isHoliday(dateKeyOf(date));

// fromKey から toKey まで（両端を含む、YYYY-MM-DD）の祝日を日付の順に。
export const holidaysBetweenKeys = (
  fromKey: string,
  toKey: string,
): JapaneseHoliday[] =>
  allHolidays()
    .filter((holiday) => holiday.dateKey >= fromKey && holiday.dateKey <= toKey)
    .sort((a, b) => (a.dateKey < b.dateKey ? -1 : 1));

// 今日（JST）から翌年の年末までの祝日。店舗設定で「祝日定休」の対象を見せるのに使う。
export const holidaysThroughNextYear = (now: Date): JapaneseHoliday[] => {
  const nextYear = Number(formatDay(now, "YYYY")) + 1;
  return holidaysBetweenKeys(dateKeyOf(now), `${nextYear}-12-31`);
};
