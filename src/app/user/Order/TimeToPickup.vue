<template>
  <div>
    <!-- Date Picker -->
    <div v-if="availableDays.length > 0">
      <div class="bg-white rounded-lg shadow p-4">
        <b-select v-model="dayIndex">
          <option
            v-for="(day, index) in availableDays"
            :value="index"
            :key="day.offset"
          >
            {{ $d(day.date, "short") }}
            <span v-if="day.offset === 0">{{ $t("date.today") }}</span>
          </option>
        </b-select>
        <b-select v-model="time" class="mt-2">
          <option
            v-for="time in availableDays[dayIndex].times"
            :value="time.time"
            :key="time.time"
            >{{ time.display }}</option
          >
        </b-select>
      </div>
    </div>

    <!-- Not Available -->
    <div v-else class="bg-red-700 bg-opacity-10 p-4 rounded-lg">
      <div class="text-base font-bold text-red-700">
        {{ $t("order.notAvailable") }}
      </div>
    </div>
  </div>
</template>

<script>
import firebase from "firebase/app";
import PickupMixin from "./pickupMixin";

export default {
  mixins: [PickupMixin],
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
    if (this.availableDays.length > 0) {
      this.time = this.availableDays[0].times[0].time;
    } else {
      this.$emit("notAvailable", true);
    }
  },
  watch: {
    dayIndex(newValue) {
      this.time = this.availableDays[newValue].times[0].time;
    },
    time() {
      console.log("time changed");
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
