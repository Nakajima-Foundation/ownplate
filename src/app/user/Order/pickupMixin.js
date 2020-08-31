import { midNight } from "~/plugins/dateUtils.js";

export default {
  computed: {
    // public
    availableDays() {
      if (!this.shopInfo.businessDay) {
        return []; // it means shopInfo is empty (not yet loaded)
      }

      const now = this.$store.state.date;
      console.log(this.$store.state.date); // never delete this line;
      const today = now.getDay();
      let suspendUntil = new Date(now);
      suspendUntil.setMinutes(now.getMinutes() + this.minimumCookTime);
      if (this.shopInfo.suspendUntil) {
        const specifiedDate = this.shopInfo.suspendUntil.toDate();
        if (specifiedDate > suspendUntil) {
          suspendUntil = specifiedDate;
        }
      }
      return Array.from(Array(this.daysInAdvance).keys())
        .filter(offset => {
          return this.businessDays[(today + offset) % 7];
        })
        .map(offset => {
          const date = midNight(offset);
          let times = this.openSlots[(today + offset) % 7];
          const delta = suspendUntil - date;
          if (delta > 0) {
            times = times.filter(time => {
              return time.time >= Math.round(delta / 60000);
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
