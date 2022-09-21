<template>
  <div>
    <!-- Date Picker -->
    <div v-if="availableDays.length > 0">
      <div class="bg-white rounded-lg shadow p-4">
        <o-select v-model="dayIndex">
          <option
            v-for="(day, index) in availableDays"
            :value="index"
            :key="day.offset"
          >
            {{ $d(day.date, "short") }}
            <span v-if="day.offset === 0">{{ $t("date.today") }}</span>
          </option>
        </o-select>
        <o-select v-model="time" class="mt-2">
          <option
            v-for="(time, index) in availableDays[dayIndex].times"
            :value="time.time"
            :key="index"
          >
            {{ time.display }}
          </option>
        </o-select>
      </div>
    </div>

    <!-- Not Available -->
    <div v-else class="bg-red-700 bg-opacity-10 p-4 rounded-lg">
      <div class="text-base font-bold text-red-700">
        {{ $t("order.notAvailable") }}
      </div>
    </div>
  </div>
</template>

<script>
import {
  defineComponent,
  computed,
  ref,
  onMounted,
  watch,
} from "@vue/composition-api";

import firebase from "firebase/compat/app";
import { isNull } from "@/utils/utils";
import { usePickupTime } from "@/utils/pickup";

export default defineComponent({
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
    orderInfo: {
      type: Object,
      required: true,
    },
    isDelivery: {
      type: Boolean,
      required: false,
    },
  },
  emits: ["notAvailable"],
  setup(props, ctx) {
    const dayIndex = ref(0);
    const time = ref(0);

    const exceptData = computed(() => {
      return (Object.values(props.orderInfo.menuItems) || []).reduce(
        (tmp, menu) => {
          const { exceptDay, exceptHour } = menu;
          Object.keys(exceptDay || {}).map((key) => {
            if (exceptDay[key]) {
              tmp.exceptDay[key] = true;
            }
          });
          if (
            !isNull(exceptHour) &&
            !isNull(exceptHour.start) &&
            !isNull(exceptHour.end)
          ) {
            tmp.exceptHours.push(exceptHour);
          }
          return tmp;
        },
        { exceptDay: {}, exceptHours: [] }
      );
    });

    const { deliveryAvailableDays, availableDays } = usePickupTime(
      props.shopInfo,
      exceptData,
      {},
      ctx
    );

    const days = computed(() => {
      return props.isDelivery
        ? deliveryAvailableDays.value
        : availableDays.value;
    });

    onMounted(() => {
      if (days.value.length > 0) {
        time.value = days.value[0].times[0].time;
      } else {
        ctx.emit("notAvailable", true);
      }
    });

    watch(days, () => {
      if (
        !(days.value[dayIndex.value]?.times || []).some((t) => {
          return time.value == t.time;
        })
      ) {
        time.value = days.value[dayIndex.value].times[0].time;
      }
    });
    watch(dayIndex, (newValue) => {
      time.value = days.value[newValue].times[0].time;
    });
    watch(time, () => {
      console.log("time changed");
    });

    // TODO: change emit
    const timeToPickup = () => {
      const date = days.value[dayIndex.value].date;
      date.setHours(time.value / 60);
      date.setMinutes(time.value % 60);
      const ts = firebase.firestore.Timestamp.fromDate(date);
      return new firebase.firestore.Timestamp(ts.seconds, ts.nanoseconds);
    };
    return {
      // called by parent
      timeToPickup,

      availableDays: days,

      dayIndex,
      time,
    };
  },
});
</script>
