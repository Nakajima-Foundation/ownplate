<template>
  <div>
    <b-field label="TimeToPickup">
      <b-select v-model="dayIndex">
        <option v-for="day in availableDays" :value="day.index" :key="day.index">
          {{ $d(day.date, "short" )}}
          <span v-if="day.index===0">{{$t('date.today')}}</span>
        </option>
      </b-select>
    </b-field>
  </div>
</template>

<script>
import { midNight } from "~/plugins/dateUtils.js";

export default {
  data() {
    return {
      dayIndex: 0
    };
  },
  props: {
    shopInfo: {
      type: Object,
      required: true
    }
  },
  mounted() {
    //console.log(this.shopInfo.businessDay);
    console.log(this.shopInfo.openTimes);
    const now = new Date();
    //console.log(this.availableDays);
  },
  computed: {
    dayOfWeek() {
      return new Date().getDay();
    },
    availableDays() {
      const today = this.dayOfWeek;
      return [0, 1, 2, 3, 4, 5, 6]
        .filter(offset => {
          return this.businessDays[(today + offset) % 7];
        })
        .map(offset => {
          const date = midNight(offset);
          //const times = this.shopInfo.openTimes
          return { index: offset, date };
        });
    },
    businessDays() {
      return [0, 1, 2, 3, 4, 5, 6].map(day => {
        const key = ((day + 6) % 7) + 1;
        return this.shopInfo.businessDay[key];
      });
    },
    openTimes() {
      return [0, 1, 2, 3, 4, 5, 6].map(day => {
        const key = ((day + 6) % 7) + 1;
        return this.shopInfo.openTimes[key];
      });
    }
  }
};
</script>
