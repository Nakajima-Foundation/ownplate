i
<template>
  <div>
    <div class="mb-2 text-sm font-bold text-black/60">
      {{ $t("admin.order.incompleteOrders") }}
    </div>

    <!-- Links for Incomplete Orders Date -->
    <div @click="closeNotificationSettings">
      <router-link
        :class="`mr-2 mb-2 inline-flex h-9 items-center justify-center rounded-full px-4 ${
          index === 0 ? 'bg-red-700/10' : 'bg-black/5'
        }`"
        :to="`/admin/restaurants/${restaurantId}/orders?day=${dateKeyOf(day.date)}`"
        v-for="(day, index) in lastSeveralDays"
        :key="day.index"
      >
        <span
          :class="`text-sm font-bold ${
            index === 0 ? 'text-red-700' : 'text-op-teal'
          }`"
        >
          {{ $d(day.date, "short") }} {{ index === 0 ? "本日" : "" }} -
          {{ orderCounter[dateKeyOf(day.date)] }}
        </span>
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from "vue";

import { useRestaurantId } from "@/utils/utils";
import { isNull } from "@/utils/commonUtils";
import { dateKeyOf, startOfDayAfter } from "@/utils/shopCalendar";

import { useGeneralStore } from "@/store";

import { RestaurantInfoData } from "@/models/RestaurantInfo";

export default defineComponent({
  props: {
    shopInfo: {
      type: Object as PropType<RestaurantInfoData>,
      required: true,
    },
  },
  emits: ["close"],
  setup(props, ctx) {
    const generalStore = useGeneralStore();
    const restaurantId = useRestaurantId();

    const pickUpDaysInAdvance = computed(() => {
      return (
        (isNull(props.shopInfo.pickUpDaysInAdvance)
          ? 3
          : props.shopInfo.pickUpDaysInAdvance) + 1
      );
    });

    const lastSeveralDays = computed(() => {
      return Array.from(Array(pickUpDaysInAdvance.value).keys()).map(
        (index) => {
          const date = startOfDayAfter(new Date(), index);
          return { index, date };
        },
      );
    });
    const orderCounter = computed(() => {
      return lastSeveralDays.value.reduce(
        (tmp: { [key: string]: number }, day) => {
          const count = (generalStore.orderObj[dateKeyOf(day.date)] || [])
            .length;
          tmp[dateKeyOf(day.date)] = count || 0;
          return tmp;
        },
        {},
      );
    });

    const closeNotificationSettings = () => {
      ctx.emit("close");
    };

    return {
      lastSeveralDays,
      orderCounter,
      dateKeyOf,
      restaurantId,
      closeNotificationSettings,
    };
  },
});
</script>
