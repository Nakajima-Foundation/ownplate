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
import { midNight } from "~/utils/dateUtils";
import moment from "moment";

export default {
  props: {
    shopInfo: Object,
  },
  computed: {
    orderCounter() {
      return this.lastSeveralDays.reduce((tmp, day) => {
        const count = (
          this.$store.state.orderObj[moment(day.date).format("YYYY-MM-DD")] ||
          []
        ).length;
        tmp[moment(day.date).format("YYYY-MM-DD")] = count || 0;
        return tmp;
      }, {});
    },
    pickUpDaysInAdvance() {
      return this.getPickUpDaysInAdvance();
    },
    lastSeveralDays() {
      return Array.from(Array(this.pickUpDaysInAdvance).keys()).map((index) => {
        const date = midNight(index);
        return { index, date };
      });
    },
  },
  methods: {
    getPickUpDaysInAdvance() {
      return this.isNull(this.shopInfo.pickUpDaysInAdvance)
        ? 3
        : this.shopInfo.pickUpDaysInAdvance;
    },
  },
};
</script>
