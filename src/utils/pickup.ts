import { computed, Ref, ComputedRef } from "vue";
import { midNight } from "@/utils/dateUtils";
import { RestaurantInfoData } from "@/models/RestaurantInfo";
import {
  num2time,
  num2simpleTime,
  num2simpleFormatedTime,
  isNull,
} from "@/utils/utils";
import moment from "moment";
import { MenuData } from "@/models/menu";
import { useGeneralStore } from "../store";

type AvailableDay = {
  offset: number;
  date: Date;
  times: { time: number; display: string }[];
};

export const usePickupTime = (
  shopInfo: RestaurantInfoData,
  exceptData: any,
  menuObj: Ref<{ [key: string]: MenuData }>,
  lunchOrDinner?: string,
  skipToday?: ComputedRef<boolean>,
) => {
  const generalStore = useGeneralStore();

  // public
  const temporaryClosure = computed(() => {
    return (shopInfo.temporaryClosure || []).map((day) => {
      return moment(day.seconds ? day.toDate() : day).format("YYYY-MM-DD");
    });
  });
  const shopInfoBusinessDay = computed(() => {
    return shopInfo.businessDay;
  });
  const shopInfoOpenTimes = computed(() => {
    return shopInfo.openTimes;
  });
  const businessDays = computed(() => {
    return [7, 1, 2, 3, 4, 5, 6].map((day) => {
      return (
        shopInfoBusinessDay.value[day] &&
        !((exceptData.value || {}).exceptDay || {})[day]
      );
    });
  });
  const availableBusinessDays = computed(() => {
    return [7, 1, 2, 3, 4, 5, 6].reduce(
      (tmp: { [key: number]: boolean }, day) => {
        tmp[day] =
          shopInfoBusinessDay.value[day] &&
          !((exceptData.value || {}).exceptDay || {})[day];
        return tmp;
      },
      {},
    );
  });
  const timeInterval = computed(() => {
    return 10; // LATER: Make it customizable
  });
  const withinExceptTime = (time: number) => {
    return ((exceptData.value || {}).exceptHours || []).some(
      (hour: { start: number; end: number }) => {
        return hour.start <= time && time <= hour.end;
      },
    );
  };
  // just for open time not consider with cooking time.
  const openSlots = computed(() => {
    return [7, 1, 2, 3, 4, 5, 6].map((day) => {
      const openTime = (() => {
        if (lunchOrDinner === "lunch") {
          if (shopInfoOpenTimes.value[day][0]) {
            return [shopInfoOpenTimes.value[day][0]];
          }
          return [];
        }
        if (lunchOrDinner === "dinner") {
          if (shopInfoOpenTimes.value[day][1]) {
            return [shopInfoOpenTimes.value[day][1]];
          }
          return [];
        }
        return shopInfoOpenTimes.value[day];
      })();

      return openTime.reduce(
        (ret: { time: number; display: string }[], value) => {
          for (
            let time = value.start;
            time <= value.end;
            time += timeInterval.value
          ) {
            if (!withinExceptTime(time)) {
              ret.push({ time, display: num2time(time) });
            }
          }
          return ret;
        },
        [],
      );
    });
  });
  const minimumCookTime = computed(() => {
    return shopInfo.pickUpMinimumCookTime || 25;
  });
  const minimumDeliveryTime = computed(() => {
    return shopInfo.deliveryMinimumCookTime || 25;
  });
  const daysInAdvance = computed(() => {
    const tmp = isNull(shopInfo.pickUpDaysInAdvance)
      ? 3
      : shopInfo.pickUpDaysInAdvance;
    return tmp + 1;
  });

  // just for display
  const getTodaysLast = (
    isAvailable: ComputedRef<boolean>,
    days: ComputedRef<AvailableDay[]>,
    minTime: ComputedRef<number>,
  ) => {
    console.log(generalStore.date); // never delete this line;
    if (isAvailable.value) {
      const lastTime = days.value[0].times[days.value[0].times.length - 1];
      const { time } = lastTime;
      const lastOrder = Math.min(
        time - minTime.value,
        shopInfo.lastOrderTime || 1000000,
      );
      // console.log(shopInfo.lastOrderTime, time, lastOrder)

      return {
        time,
        display: num2simpleFormatedTime(time),
        timeStr: num2simpleTime(time),
        lastOrder,
        lastOrderDisplay: num2simpleFormatedTime(lastOrder),
        lastOrderStr: num2simpleTime(lastOrder),
        lastOrderTime: num2time(lastOrder),
      };
    }
    return null;
  };

  // for public days api.
  const getAvailableDays = (minimumTime: number) => {
    if (!shopInfoBusinessDay.value) {
      return []; // it means shopInfo is empty (not yet loaded)
    }
    const now = generalStore.date;
    console.log(generalStore.date); // never delete this line;
    const today = now.getDay();
    let suspendUntil = new Date(now);
    suspendUntil.setMinutes(now.getMinutes() + minimumTime);
    if (shopInfo.suspendUntil) {
      const specifiedDate = shopInfo.suspendUntil.toDate();
      if (specifiedDate > suspendUntil) {
        suspendUntil = specifiedDate;
      }
    }
    return Array.from(Array(daysInAdvance.value).keys())
      .filter((offset) => {
        if (skipToday && skipToday.value && offset === 0) {
          console.log("skip", skipToday);
          return false;
        }
        return businessDays.value[(today + offset) % 7];
      })
      .filter((offset) => {
        const date = moment(midNight(offset)).format("YYYY-MM-DD");
        return !temporaryClosure.value.includes(date);
      })
      .map((offset) => {
        const date = midNight(offset);
        const delta = suspendUntil.getTime() - date.getTime();
        const times = openSlots.value[(today + offset) % 7].filter(
          (time: { time: number }) => {
            if (delta > 0) {
              return time.time >= Math.ceil(delta / 60000);
            }
            return true;
          },
        );
        return { offset, date, times };
      })
      .filter((day) => {
        return day.times.length > 0;
      });
  };
  const getAvailableDaysWithLastOrderTime = (minimumTime: number) => {
    return getAvailableDays(minimumTime).map((a) => {
      const { offset, date, times } = a;
      const newTimes = times.filter((b: { time: number }) => {
        // console.log(b, shopInfo.lastOrderTime);
        if (shopInfo.lastOrderTime) {
          // console.log(shopInfo.lastOrderTime, b.time)
          return shopInfo.lastOrderTime + minimumTime >= b.time;
        }
        return true;
      });
      return { offset, date, times: newTimes };
    });
  };

  // for last order
  const availableDaysRaw = computed<AvailableDay[]>(() => {
    return getAvailableDays(minimumCookTime.value);
  });
  const deliveryAvailableDaysRaw = computed<AvailableDay[]>(() => {
    return getAvailableDays(minimumDeliveryTime.value);
  });

  // public
  const availableDays = computed<AvailableDay[]>(() => {
    return getAvailableDaysWithLastOrderTime(minimumCookTime.value);
  });
  const isAvailableToday = computed(() => {
    return (
      availableDays.value.length > 0 && availableDays.value[0].offset === 0
    );
  });
  const todaysLast = computed(() => {
    return getTodaysLast(isAvailableToday, availableDaysRaw, minimumCookTime);
  });
  // public
  const deliveryAvailableDays = computed<AvailableDay[]>(() => {
    return getAvailableDaysWithLastOrderTime(minimumDeliveryTime.value);
  });
  const deliveryIsAvailableToday = computed(() => {
    return (
      deliveryAvailableDays.value.length > 0 &&
      deliveryAvailableDays.value[0].offset === 0
    );
  });
  const deliveryTodaysLast = computed(() => {
    return getTodaysLast(
      deliveryIsAvailableToday,
      deliveryAvailableDaysRaw,
      minimumDeliveryTime,
    );
  });

  // public
  const menuPickupData = computed(() => {
    return Object.keys(menuObj.value || {}).reduce(
      (tmp: { [key: string]: any }, key) => {
        const menu = menuObj.value[key];
        const { exceptDay, exceptHour } = menu;
        const hasExceptHour =
          !isNull(exceptHour) &&
          !isNull(exceptHour.start) &&
          !isNull(exceptHour.end);
        const hasExceptDay =
          (Object.values(exceptDay || {}) || []).filter((a) => a).length > 0;
        const menuAvailableDays = Object.keys(
          availableBusinessDays.value || {},
        ).reduce((arr: string[], day: any) => {
          if (availableBusinessDays.value[day] && !(exceptDay || {})[day]) {
            arr.push(day);
          }
          return arr;
        }, []);

        tmp[menu.id!] = {
          hasExceptData: hasExceptDay || hasExceptHour,
          hasExceptDay,
          hasExceptHour,
          menuAvailableDays,
          exceptHour,
        };
        return tmp;
      },
      {},
    );
  });

  return {
    deliveryAvailableDays,
    availableDays,
    temporaryClosure,
    menuPickupData,
    todaysLast,
    deliveryTodaysLast,
  };
};
