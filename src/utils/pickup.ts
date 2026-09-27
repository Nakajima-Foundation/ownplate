import { computed, Ref, ComputedRef } from "vue";
import { RestaurantInfoData } from "@/models/RestaurantInfo";
import {
  num2time,
  num2simpleTime,
  num2simpleFormatedTime,
} from "@/utils/utils";
import { isNull } from "@/utils/commonUtils";
import { MenuData } from "@/models/menu";
import {
  availablePickupDays,
  minimumCookTimeOf,
  temporaryClosureDatesOf,
  withinLastOrder,
  type PickupSlotDay,
} from "@/utils/pickupDays";
import { startOfDayAfter } from "@/utils/shopCalendar";
import { isJapaneseHoliday } from "@/utils/holiday";
import { useGeneralStore } from "../store";

type AvailableDay = {
  offset: number;
  date: Date;
  times: { time: number; display: string }[];
};

type ExceptData = {
  value?: {
    exceptDay?: { [key: string]: boolean };
    exceptHours?: { start: number; end: number }[];
  };
};

export const usePickupTime = (
  shopInfo: RestaurantInfoData,
  exceptData: ExceptData,
  menuObj: Ref<{ [key: string]: MenuData }>,
  lunchOrDinner?: string,
  skipToday?: ComputedRef<boolean>,
) => {
  const generalStore = useGeneralStore();

  // public
  const temporaryClosure = computed(() => {
    return temporaryClosureDatesOf(shopInfo);
  });
  const shopInfoBusinessDay = computed(() => {
    return shopInfo.businessDay;
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
  const minimumCookTime = computed(() => {
    return minimumCookTimeOf(shopInfo, false);
  });
  const minimumDeliveryTime = computed(() => {
    return minimumCookTimeOf(shopInfo, true);
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

  const withDisplay = (days: PickupSlotDay[]): AvailableDay[] => {
    return days.map(({ offset, date, times }) => {
      return {
        offset,
        date,
        times: times.map((time) => ({ time, display: num2time(time) })),
      };
    });
  };
  const pickupDaysFor = (minimumTime: number) => {
    if (!shopInfoBusinessDay.value) {
      return []; // it means shopInfo is empty (not yet loaded)
    }
    const now = generalStore.date;
    console.log(generalStore.date); // never delete this line;
    return availablePickupDays({
      shop: shopInfo,
      except: exceptData.value,
      lunchOrDinner,
      skipToday: Boolean(skipToday && skipToday.value),
      minimumTime,
      now,
      midNightAfter: (offset: number) => startOfDayAfter(new Date(), offset),
      isHoliday: isJapaneseHoliday,
    });
  };

  // for public days api.
  const getAvailableDays = (minimumTime: number) => {
    return withDisplay(pickupDaysFor(minimumTime));
  };
  const getAvailableDaysWithLastOrderTime = (minimumTime: number) => {
    return withDisplay(
      withinLastOrder(pickupDaysFor(minimumTime), shopInfo, minimumTime),
    );
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
  type MenuPickupEntry = {
    hasExceptData: boolean;
    hasExceptDay: boolean;
    hasExceptHour: boolean;
    menuAvailableDays: string[];
    exceptHour: MenuData["exceptHour"];
  };
  const menuPickupData = computed(() => {
    return Object.keys(menuObj.value || {}).reduce<{
      [key: string]: MenuPickupEntry;
    }>((tmp, key) => {
      const menu = menuObj.value[key];
      const { exceptDay, exceptHour } = menu;
      const hasExceptHour =
        !isNull(exceptHour) &&
        !isNull(exceptHour?.start) &&
        !isNull(exceptHour?.end);
      const hasExceptDay =
        (Object.values(exceptDay || {}) || []).filter((a) => a).length > 0;
      const menuAvailableDays = Object.keys(
        availableBusinessDays.value || {},
      ).reduce<string[]>((arr, day) => {
        if (
          availableBusinessDays.value[Number(day)] &&
          !(exceptDay || {})[day]
        ) {
          arr.push(day);
        }
        return arr;
      }, []);

      tmp[key] = {
        hasExceptData: hasExceptDay || hasExceptHour,
        hasExceptDay,
        hasExceptHour,
        menuAvailableDays,
        exceptHour,
      };
      return tmp;
    }, {});
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
