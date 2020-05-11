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
    <b-select v-model="timeIndex">
      <option v-for="time in availableDays[dayIndex].times" :value="time" :key="time">{{ time }}</option>
    </b-select>
  </div>
</template>

<script>
import { midNight } from "~/plugins/dateUtils.js";

export default {
  data() {
    return {
      dayIndex: 0,
      timeIndex: 0
    };
  },
  props: {
    shopInfo: {
      type: Object,
      required: true
    }
  },
  mounted() {
    this.timeIndex = this.availableDays[0].times[0];
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
          const times = this.openSlots[(today + offset) % 7];
          console.log(times);
          return { index: offset, date, times };
        });
    },
    businessDays() {
      return [0, 1, 2, 3, 4, 5, 6].map(day => {
        const key = ((day + 6) % 7) + 1;
        return this.shopInfo.businessDay[key];
      });
    },
    openSlots() {
      return [0, 1, 2, 3, 4, 5, 6].map(day => {
        const key = ((day + 6) % 7) + 1;
        return this.shopInfo.openTimes[key].reduce((ret, value) => {
          for (
            let time = value.start;
            time < value.end;
            time += this.timeInterval
          ) {
            ret.push(time);
          }
          return ret;
        }, []);
      });
    },
    timeInterval() {
      return 10; // LATER: Make it customizable
    }
  }
};
</script>
