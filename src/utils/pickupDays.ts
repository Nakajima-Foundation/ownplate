import moment from "moment";

import { isNull } from "./commonUtils";
import type { RestaurantInfoData } from "../models/RestaurantInfo";

// 受け取れる日と時刻の決まり。画面（usePickupTime）が選択肢を作るのに使う。
// Vue・store・i18n に頼らないので、時刻の表示文字列はここでは作らない。

export type PickupShop = Pick<
  RestaurantInfoData,
  | "businessDay"
  | "openTimes"
  | "temporaryClosure"
  | "suspendUntil"
  | "pickUpDaysInAdvance"
  | "lastOrderTime"
>;

export type PickupExcept = {
  exceptDay?: { [key: string]: boolean };
  exceptHours?: { start: number; end: number }[];
};

export type PickupSlotDay = { offset: number; date: Date; times: number[] };

export type PickupDaysInput = {
  shop: PickupShop;
  except: PickupExcept | undefined;
  lunchOrDinner?: string;
  skipToday: boolean;
  minimumTime: number;
  now: Date;
  // 今日から offset 日後の 0 時。画面は端末の時計で作る。
  midNightAfter: (offset: number) => Date;
};

export const PICKUP_TIME_INTERVAL_MIN = 10;
const DEFAULT_DAYS_IN_ADVANCE = 3;
const WEEKDAYS_FROM_SUNDAY = [7, 1, 2, 3, 4, 5, 6];
const MS_PER_MINUTE = 60000;

// 臨時休業は2つの形で届く。Firestore から読んだ直後は Timestamp、画面が日付を足した
// あとや Wrapper が変換したあとは素の Date。seconds があるかどうかで見分ける。
const isTimestamp = (
  day: RestaurantInfoData["temporaryClosure"][number],
): day is { toDate: () => Date; seconds?: number } =>
  !(day instanceof Date) && Boolean(day.seconds);

export const temporaryClosureDatesOf = (
  shop: Pick<PickupShop, "temporaryClosure">,
) =>
  (shop.temporaryClosure || []).map((day) => {
    return moment(isTimestamp(day) ? day.toDate() : day).format("YYYY-MM-DD");
  });

// 日曜始まりの曜日ごとに、店が開いていて除外もされていないか。
export const businessDaysOf = (
  shop: Pick<PickupShop, "businessDay">,
  except: PickupExcept | undefined,
) =>
  WEEKDAYS_FROM_SUNDAY.map((day) => {
    return shop.businessDay[day] && !((except || {}).exceptDay || {})[day];
  });

const withinExceptTime = (except: PickupExcept | undefined, time: number) =>
  ((except || {}).exceptHours || []).some((hour) => {
    return hour.start <= time && time <= hour.end;
  });

// 日曜始まりの曜日ごとの、受け取れる時刻（0 時からの分）。調理時間は考えない。
export const openSlotsOf = (
  shop: Pick<PickupShop, "openTimes">,
  except: PickupExcept | undefined,
  lunchOrDinner?: string,
) =>
  WEEKDAYS_FROM_SUNDAY.map((day) => {
    const openTime = (() => {
      if (lunchOrDinner === "lunch") {
        if (shop.openTimes[day][0]) {
          return [shop.openTimes[day][0]];
        }
        return [];
      }
      if (lunchOrDinner === "dinner") {
        if (shop.openTimes[day][1]) {
          return [shop.openTimes[day][1]];
        }
        return [];
      }
      return shop.openTimes[day];
    })();

    return openTime.reduce((ret: number[], value) => {
      for (
        let time = value.start;
        time <= value.end;
        time += PICKUP_TIME_INTERVAL_MIN
      ) {
        if (!withinExceptTime(except, time)) {
          ret.push(time);
        }
      }
      return ret;
    }, []);
  });

export const daysInAdvanceOf = (
  shop: Pick<PickupShop, "pickUpDaysInAdvance">,
) => {
  const tmp = isNull(shop.pickUpDaysInAdvance)
    ? DEFAULT_DAYS_IN_ADVANCE
    : shop.pickUpDaysInAdvance;
  return tmp + 1;
};

// 調理時間と注文停止のぶん、これより前の時刻は受け取れない。
const earliestPickupOf = (shop: PickupShop, now: Date, minimumTime: number) => {
  const soonest = new Date(now);
  soonest.setMinutes(now.getMinutes() + minimumTime);
  if (shop.suspendUntil) {
    const specifiedDate = shop.suspendUntil.toDate();
    if (specifiedDate > soonest) {
      return specifiedDate;
    }
  }
  return soonest;
};

// 受け取れる日（今日から offset 日後）と、その日の時刻。
// 曜日の一覧・臨時休業・時刻の一覧は、要るところまで進んでから作る（壊れた設定で例外が
// 出るのは、画面がそこまで進んだときだけ）。
export const availablePickupDays = (
  input: PickupDaysInput,
): PickupSlotDay[] => {
  const { shop, except, now, minimumTime, midNightAfter } = input;
  if (!shop.businessDay) {
    return [];
  }
  const today = now.getDay();
  const earliest = earliestPickupOf(shop, now, minimumTime);
  const offsets = Array.from(Array(daysInAdvanceOf(shop)).keys());
  const businessDays = offsets.length > 0 ? businessDaysOf(shop, except) : [];
  const businessOffsets = offsets.filter((offset) => {
    if (input.skipToday && offset === 0) {
      console.log("skip", input.skipToday);
      return false;
    }
    return businessDays[(today + offset) % 7];
  });
  if (businessOffsets.length === 0) {
    return [];
  }
  const closedDates = temporaryClosureDatesOf(shop);
  const openOffsets = businessOffsets.filter((offset) => {
    const date = moment(midNightAfter(offset)).format("YYYY-MM-DD");
    return !closedDates.includes(date);
  });
  if (openOffsets.length === 0) {
    return [];
  }
  const openSlots = openSlotsOf(shop, except, input.lunchOrDinner);
  return openOffsets
    .map((offset) => {
      const date = midNightAfter(offset);
      const delta = earliest.getTime() - date.getTime();
      const times = openSlots[(today + offset) % 7].filter((time) => {
        if (delta > 0) {
          return time >= Math.ceil(delta / MS_PER_MINUTE);
        }
        return true;
      });
      return { offset, date, times };
    })
    .filter((day) => {
      return day.times.length > 0;
    });
};

// ラストオーダーを過ぎる時刻を外す。
export const withinLastOrder = (
  days: PickupSlotDay[],
  shop: Pick<PickupShop, "lastOrderTime">,
  minimumTime: number,
): PickupSlotDay[] =>
  days.map((day) => {
    const { offset, date, times } = day;
    const newTimes = times.filter((time) => {
      if (shop.lastOrderTime) {
        return shop.lastOrderTime + minimumTime >= time;
      }
      return true;
    });
    return { offset, date, times: newTimes };
  });
