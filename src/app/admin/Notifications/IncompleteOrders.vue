<template>
  <div>
    <div
      class="t-subtitle2 c-text-black-medium m-t-16"
      >{{ $t("admin.order.incompleteOrders") }}</div>
    <!-- Links for Incomplete Orders Date -->
    <div>
      <!-- # Show latest date first -->
      <!-- # Make Red Color for Today -->
      <router-link
        :class="`op-button-pill ${index === 0 ? 'bg-status-red-bg' : 'bg-form'} m-t-8 m-r-8`"
        :to="`/admin/restaurants/${restaurantId()}/orders?day=${moment(day.date).format('YYYY-MM-DD')}`"
        v-for="(day, index) in lastSeveralDays"
        :key="day.index"
        >
        <!-- # Link to the date -->
        <span :class="`t-button ${index === 0 ? 'c-status-red' : 'c-primary'}`">
          {{$d(day.date, "short")}} {{index === 0 ? '本日' : ''}} - {{ orderCounter[moment(day.date).format("YYYY-MM-DD")] }}
        </span>
      </router-link>

      <!-- # Future Date will be Nomal Color -->
    </div>
  </div>
</template>

<script>
import { midNight } from "~/plugins/dateUtils.js";
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
      return Array.from(Array(this.pickUpDaysInAdvance).keys()).map(
        index => {
          const date = midNight(index);
          return { index, date };
        }
      );
    }
  },
  methods: {
    getPickUpDaysInAdvance() {
      return this.isNull(this.shopInfo.pickUpDaysInAdvance)
        ? 3
        : this.shopInfo.pickUpDaysInAdvance;
    }
  }
}
</script>
