import { computed, Ref } from "@vue/composition-api";
import { midNight } from "@/utils/dateUtils";
import { RestaurantInfoData } from "@/models/RestaurantInfo";
import { num2time, isNull } from "@/utils/utils";
import moment from "moment";
import { MenuData } from "@/models/menu";

export const usePickupTime = (
  shopInfo: RestaurantInfoData,
  exceptData: any,
  menuObj: Ref<{ [key: string]: MenuData }>,
  ctx: any
) => {
  // public
  const temporaryClosure = computed(() => {
    return (shopInfo.temporaryClosure || []).map((day) => {
      return moment(day).format("YYYY-MM-DD");
    });
  });
  const businessDays = computed(() => {
    return [7, 1, 2, 3, 4, 5, 6].map((day) => {
      return (
        shopInfo.businessDay[day] &&
        !((exceptData.value || {}).exceptDay || {})[day]
      );
    });
  });
  const availableBusinessDays = computed(() => {
    return [7, 1, 2, 3, 4, 5, 6].reduce(
      (tmp: { [key: number]: boolean }, day) => {
        tmp[day] =
          shopInfo.businessDay[day] &&
          !((exceptData.value || {}).exceptDay || {})[day];
        return tmp;
      },
      {}
    );
  });
  const timeInterval = computed(() => {
    return 10; // LATER: Make it customizable
  });
  const withinExceptTime = (time: number) => {
    return ((exceptData.value || {}).exceptHours || []).some(
      (hour: { start: number; end: number }) => {
        return hour.start <= time && time <= hour.end;
      }
    );
  };
  const openSlots = computed(() => {
    return [7, 1, 2, 3, 4, 5, 6].map((day) => {
      return shopInfo.openTimes[day].reduce((ret, value) => {
        for (
          let time = value.start;
          time < value.end;
          time += timeInterval.value
        ) {
          if (!withinExceptTime(time)) {
            ret.push({ time, display: num2time(time, ctx.root) });
          }
        }
        return ret;
      }, []);
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

  const getAvailableDays = (minimumTime: number) => {
    if (!shopInfo.businessDay) {
      return []; // it means shopInfo is empty (not yet loaded)
    }

    const now = ctx.root.$store.state.date;
    console.log(ctx.root.$store.state.date); // never delete this line;
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
        return businessDays.value[(today + offset) % 7];
      })
      .filter((offset) => {
        const date = moment(midNight(offset)).format("YYYY-MM-DD");
        return !temporaryClosure.value.includes(date);
      })
      .map((offset) => {
        const date = midNight(offset);
        let times = openSlots.value[(today + offset) % 7];
        const delta = suspendUntil.getTime() - date.getTime();
        if (delta > 0) {
          times = times.filter((time: { time: number }) => {
            return time.time >= Math.round(delta / 60000);
          });
        }

        return { offset, date, times };
      })
      .filter((day) => {
        return day.times.length > 0;
      });
  };

  const availableDays = computed(() => {
    return getAvailableDays(minimumCookTime.value);
  });
  const deliveryAvailableDays = computed(() => {
    return getAvailableDays(minimumDeliveryTime.value);
  });

  const menuPickupData = computed(() => {
    return Object.keys(menuObj.value || {}).reduce(
      (tmp: { [key: string]: any }, key) => {
        const menu = menuObj.value[key];
        const { exceptDay, exceptHour } = menu;
        const hasExceptHour =
          !isNull(exceptHour) &&
          !isNull(exceptHour.start) &&
          !isNull(exceptHour.end);
        const hasExceptDay = Object.keys(exceptDay || {}).length > 0;
        const menuAvailableDays = Object.keys(
          availableBusinessDays.value || {}
        ).reduce((arr: string[], day) => {
          if (!(exceptDay || {})[day]) {
            arr.push(day);
          }
          return arr;
        }, []);

        tmp[menu.id] = {
          hasExceptData: hasExceptDay || hasExceptHour,
          hasExceptDay,
          hasExceptHour,
          menuAvailableDays,
          exceptHour,
        };
        return tmp;
      },
      {}
    );
  });

  return {
    deliveryAvailableDays,
    availableDays,
    temporaryClosure,
    menuPickupData,
  };
};
