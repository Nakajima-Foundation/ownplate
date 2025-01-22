i
<template>
  <div>
    <div class="mb-2 text-sm font-bold text-black text-opacity-60">
      {{ $t("admin.order.incompleteOrders") }}
    </div>

    <!-- Links for Incomplete Orders Date -->
    <div @click="closeNotificationSettings">
      <router-link
        :class="`mb-2 mr-2 inline-flex h-9 items-center justify-center rounded-full px-4 ${
          index === 0 ? 'bg-red-700 bg-opacity-10' : 'bg-black bg-opacity-5'
        }`"
        :to="`/admin/restaurants/${restaurantId}/orders?day=${moment(
          day.date,
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

<script lang="ts">
import { defineComponent, computed, PropType } from "vue";

import { isNull, useRestaurantId } from "@/utils/utils";
import { midNight } from "@/utils/dateUtils";
import moment from "moment";

import { useStore } from "vuex";

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
    const store = useStore();
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
          const date = midNight(index);
          return { index, date };
        },
      );
    });
    const orderCounter = computed(() => {
      return lastSeveralDays.value.reduce(
        (tmp: { [key: string]: number }, day) => {
          const count = (
            store.state.orderObj[moment(day.date).format("YYYY-MM-DD")] || []
          ).length;
          tmp[moment(day.date).format("YYYY-MM-DD")] = count || 0;
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
      moment,
      restaurantId,
      closeNotificationSettings,
    };
  },
});
</script>
