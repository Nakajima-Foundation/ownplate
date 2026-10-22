import { exceptDataOf } from "./exceptData";
import { isJapaneseHoliday } from "./holiday";
import {
  availablePickupDays,
  minimumCookTimeOf,
  withinLastOrder,
  type PickupCookTimes,
  type PickupShop,
} from "./pickupDays";
import { dateKeyOf, pickupDateOf, startOfDayAfter } from "./shopCalendar";
import type { MenuData } from "../models/menu";

// 送られてきた受取日時が、注文を確定した時点で画面が出す選択肢に入っているか。
// 画面と同じ決まり（pickupDays）で、店の時刻（JST）で数える。
// 「本日売り切れ」で今日を外す分は見ない（注文の写しに売り切れの日が無いため）。

export type PickupCheckInput = {
  shop: PickupShop & PickupCookTimes;
  menuItems: { [key: string]: MenuData } | undefined;
  lunchOrDinner?: string;
  isDelivery: boolean;
  now: Date;
  pickupAt: Date;
};

export type PickupCheckResult =
  | { offered: true }
  // day: その日が選択肢に無い。time: 日はあるがその時刻が無い。
  | { offered: false; reason: "day" | "time" };

export const checkPickupOffered = (
  input: PickupCheckInput,
): PickupCheckResult => {
  const { shop, now, pickupAt } = input;
  const minimumTime = minimumCookTimeOf(shop, input.isDelivery);
  const days = withinLastOrder(
    availablePickupDays({
      shop,
      except: exceptDataOf(input.menuItems),
      lunchOrDinner: input.lunchOrDinner,
      skipToday: false,
      minimumTime,
      now,
      midNightAfter: (offset) => startOfDayAfter(now, offset),
      isHoliday: isJapaneseHoliday,
    }),
    shop,
    minimumTime,
  );
  const pickupTime = pickupAt.getTime();
  const offered = days.some((day) =>
    day.times.some(
      (time) => pickupDateOf(day.date, time).getTime() === pickupTime,
    ),
  );
  if (offered) {
    return { offered: true };
  }
  const pickupDay = dateKeyOf(pickupAt);
  const dayOffered = days.some((day) => dateKeyOf(day.date) === pickupDay);
  return { offered: false, reason: dayOffered ? "time" : "day" };
};
