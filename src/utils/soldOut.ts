import { dateKeyOf } from "./shopCalendar";

// 「本日売り切れ」は売り切れにした日（JST の YYYY-MM-DD）を持つ。今日と同じ日なら売り切れ。
export const soldOutTodayKeyOf = (now: Date): string => dateKeyOf(now);

export const isSoldOutOn = (
  soldOutToday: string | null | undefined,
  now: Date,
): boolean => soldOutToday === soldOutTodayKeyOf(now);
