<template>
  <div>
    <b-field label="TimeToPickup">
      <b-select v-model="dayIndex">
        <option v-for="(day, index) in availableDays" :value="index" :key="day.offset">
          {{ $d(day.date, "short" )}}
          <span v-if="day.offset===0">{{$t('date.today')}}</span>
        </option>
      </b-select>
    </b-field>
    <b-select v-model="time">
      <option
        v-for="time in availableDays[dayIndex].times"
        :value="time.time"
        :key="time.time"
      >{{ time.display }}</option>
    </b-select>
  </div>
</template>

<script>
import { midNight } from "~/plugins/dateUtils.js";
import * as firebase from "firebase/app";

export default {
  data() {
    return {
      dayIndex: 0,
      time: 0
    };
  },
  props: {
    shopInfo: {
      type: Object,
      required: true
    }
  },
  mounted() {
    this.time = this.availableDays[0].times[0].time;
  },
  watch: {
    dayIndex(newValue) {
      this.time = this.availableDays[newValue].times[0].time;
    },
    time() {
      console.log("time changed");
    }
  },
  computed: {
    dayOfWeek() {
      return new Date().getDay();
    },
    availableDays() {
      const today = this.dayOfWeek;
      return Array.from(Array(this.daysInAdvance).keys())
        .filter(offset => {
          return this.businessDays[(today + offset) % 7];
        })
        .map(offset => {
          const date = midNight(offset);
          let times = this.openSlots[(today + offset) % 7];
          if (offset === 0) {
            const now = new Date();
            const localMin = now.getHours() * 60 + now.getMinutes();
            times = times.filter(time => {
              return time.time >= localMin + this.minimumCookTime;
            });
          }
          return { offset, date, times };
        })
        .filter(day => {
          return day.times.length > 0;
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
            ret.push({ time, display: this.num2time(time) });
          }
          return ret;
        }, []);
      });
    },
    timeInterval() {
      return 10; // LATER: Make it customizable
    },
    minimumCookTime() {
      return 25; // LATER: Make it customizable
    },
    daysInAdvance() {
      return 4; // LATER: Make it customizable
    }
  },
  methods: {
    timeToPickup() {
      const date = this.availableDays[this.dayIndex].date;
      date.setHours(this.time / 60);
      date.setMinutes(this.time % 60);
      const ts = firebase.firestore.Timestamp.fromDate(date);
      return new firebase.firestore.Timestamp(ts.seconds, ts.nanoseconds);
    }
  }
};
</script>
