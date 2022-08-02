import { computed } from "@vue/composition-api";
import { midNight } from "@/utils/dateUtils";
import { RestaurantInfoData } from "@/models/RestaurantInfo";
import { num2time, isNull } from "@/utils/utils";
import moment from "moment";

export const usePickupTime = (shopInfo: RestaurantInfoData, ctx: any) => {
  // public
  const temporaryClosure = computed(() => {
    return (shopInfo.temporaryClosure || []).map((day) => {
      return moment(day).format("YYYY-MM-DD");
    });
  });
  const businessDays = computed(() => {
    return [7, 1, 2, 3, 4, 5, 6].map((day) => {
      return shopInfo.businessDay[day];
    });
  });
  const timeInterval = computed(() => {
    return 10; // LATER: Make it customizable
  });
  const openSlots = computed(() => {
    return [7, 1, 2, 3, 4, 5, 6].map((day) => {
      return shopInfo.openTimes[day].reduce((ret, value) => {
        for (
          let time = value.start;
          time < value.end;
          time += timeInterval.value
        ) {
          ret.push({ time, display: num2time(time, ctx.root) });
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
          times = times.filter((time: {time: number}) => {
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

  return {
    deliveryAvailableDays,
    availableDays,
    temporaryClosure,
  };
};
