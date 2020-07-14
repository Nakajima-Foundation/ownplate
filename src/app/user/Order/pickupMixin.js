import { midNight } from "~/plugins/dateUtils.js";

export default {
  computed: {
    dayOfWeek() {
      return new Date().getDay();
    },
    // public
    availableDays() {
      if (!this.shopInfo.businessDay) {
        return []; // it means shopInfo is empty (not yet loaded)
      }
      const suspendUntil = this.shopInfo.suspendUntil && this.shopInfo.suspendUntil.toDate();

      const today = this.dayOfWeek;
      const now = this.$store.state.date;
      console.log(this.$store.state.date); // never delete this line;
      const localMin = now.getHours() * 60 + now.getMinutes();
      return Array.from(Array(this.daysInAdvance).keys())
        .filter(offset => {
          return this.businessDays[(today + offset) % 7];
        })
        .map(offset => {
          const date = midNight(offset);
          let times = this.openSlots[(today + offset) % 7];
          if (offset === 0) {
            times = times.filter(time => {
              return time.time >= localMin + this.minimumCookTime;
            });
          }
          if (suspendUntil && (suspendUntil - date) > 0) {
            times = times.filter(time => {
              return time.time >= Math.round((suspendUntil - date) / 60000);
            });
          }

          return { offset, date, times };
        })
        .filter(day => {
          return day.times.length > 0;
        });
    },
    businessDays() {
      return [7, 1, 2, 3, 4, 5, 6].map(day => {
        return this.shopInfo.businessDay[day];
      });
    },
    openSlots() {
      return [7, 1, 2, 3, 4, 5, 6].map(day => {
        return this.shopInfo.openTimes[day].reduce((ret, value) => {
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
      return this.shopInfo.pickUpMinimumCookTime || 25;
    },
    daysInAdvance() {
      const tmp = this.isNull(this.shopInfo.pickUpDaysInAdvance)
        ? 3
        : this.shopInfo.pickUpDaysInAdvance;
      return tmp + 1;
    }
  }
}
