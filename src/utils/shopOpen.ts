import { daysOfWeek } from "../config/constant";
import type { RestaurantInfoData } from "../models/RestaurantInfo";
import { minutesOfDay, weekdayOf } from "./shopCalendar";

// 営業時間の一覧で、今日の行だけ「今が営業時間内か」を持つ。ほかの曜日はいつも false。
// 営業時間のキーは "1"（月）〜"7"（日）、weekdayOf は日曜が 0 なので % 7 でそろえる。
export const openNowByDay = (
  businessDay: RestaurantInfoData["businessDay"],
  openTimes: RestaurantInfoData["openTimes"],
  now: Date,
): { [day: string]: boolean } =>
  Object.keys(daysOfWeek).reduce((tmpObj: { [key: string]: boolean }, day) => {
    if (weekdayOf(now) === Number(day) % 7 && businessDay[day]) {
      const nowMinutes = minutesOfDay(now);
      tmpObj[day] = openTimes[day].reduce(
        (tmpOpen, time) =>
          tmpOpen || (nowMinutes >= time.start && nowMinutes <= time.end),
        false,
      );
    } else {
      tmpObj[day] = false;
    }
    return tmpObj;
  }, {});
