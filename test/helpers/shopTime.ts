// 店の時刻（JST）で年月日時分を指定した瞬間。受取日時の計算は JST で数えるので、
// 試験の日時もこれで組み立てる（端末のタイムゾーンによらず同じ瞬間になる）。月は 1 始まり。
const SHOP_OFFSET_HOURS = 9;

export const shopTime = (
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
  ms = 0,
): Date =>
  new Date(
    Date.UTC(
      year,
      month - 1,
      day,
      hour - SHOP_OFFSET_HOURS,
      minute,
      second,
      ms,
    ),
  );
