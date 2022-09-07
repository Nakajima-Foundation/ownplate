<template>
  <div>
    <div class="text-sm font-bold text-black text-opacity-60 mb-2">
      {{ $t("admin.order.incompleteOrders") }}
    </div>

    <!-- Links for Incomplete Orders Date -->
    <div>
      <router-link
        :class="`inline-flex justify-center items-center px-4 h-9 rounded-full mb-2 mr-2 ${
          index === 0 ? 'bg-red-700 bg-opacity-10' : 'bg-black bg-opacity-5'
        }`"
        :to="`/admin/restaurants/${restaurantId()}/orders?day=${moment(
          day.date
        ).format('YYYY-MM-DD')}`"
        v-for="(day, index) in lastSeveralDays"
        :key="day.index"
      >
        <span
          :class="`text-sm font-bold ${
            index === 0 ? 'text-red-700' : 'text-op-teal'
          }`"
        >
          {{ $d(day.date, "short") }} {{ index === 0 ? "本日" : "" }} -
          {{ orderCounter[moment(day.date).format("YYYY-MM-DD")] }}
        </span>
      </router-link>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed } from "@vue/composition-api";

import { isNull } from "@/utils/utils";
import { midNight } from "@/utils/dateUtils";
import moment from "moment";

export default defineComponent({
  props: {
    shopInfo: Object,
  },
  setup(props, ctx) {
    const pickUpDaysInAdvance = computed(() => {
      return (
        (isNull(props.shopInfo.pickUpDaysInAdvance)
          ? 3
          : props.shopInfo.pickUpDaysInAdvance) + 1
      );
    });

    const orderCounter = computed(() => {
      return lastSeveralDays.value.reduce((tmp, day) => {
        const count = (
          ctx.root.$store.state.orderObj[
            moment(day.date).format("YYYY-MM-DD")
          ] || []
        ).length;
        tmp[moment(day.date).format("YYYY-MM-DD")] = count || 0;
        return tmp;
      }, {});
    });
    const lastSeveralDays = computed(() => {
      return Array.from(Array(pickUpDaysInAdvance.value).keys()).map(
        (index) => {
          const date = midNight(index);
          return { index, date };
        }
      );
    });

    return {
      lastSeveralDays,
      orderCounter,
    };
  },
});
</script>
