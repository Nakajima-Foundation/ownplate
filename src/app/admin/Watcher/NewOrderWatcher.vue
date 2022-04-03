<template></template>

<script>
import { db, firestore } from "@/plugins/firebase";
import { midNight } from "@/utils/dateUtils";
import { order_status } from "@/config/constant";

export default {
  props: {
    notificationConfig: Object,
  },
  data() {
    // intervalTime was 60
    const intervalTime = [
      "OQBBSOa3CgEv35smSDVK", // debug
      "GiZEOBRwDGmdpuqKKlyq",
      "KNfeQdS7DM07ObWlZTsn",
    ].includes(this.restaurantId())
      ? 4
      : 60;
    // console.log(intervalTime);

    return {
      order_detacher: () => {},
      orders: [],
      intervalTask: {},
      intervalTime, // (seconds)
    };
  },
  async created() {
    this.dateWasUpdated();
    this.intervalTask = setInterval(() => {
      console.log(
        "newOrderWatcher: conf=" +
          this.notificationConfig.infinityNotification +
          " order=" +
          this.hasNewOrder
      );
      if (this.notificationConfig.infinityNotification && this.hasNewOrder) {
        this.soundPlay("NewOrderWatcher: play");
      }
    }, 1000 * this.intervalTime);
  },
  destroyed() {
    this.order_detacher();
    clearInterval(this.intervalTask);
  },
  computed: {
    today() {
      return midNight(0);
    },
    tommorow() {
      return midNight(1);
    },
    hasNewOrder() {
      return this.orders.length > 0;
    },
  },
  watch: {
    today() {
      this.dateWasUpdated();
    },
  },
  methods: {
    dateWasUpdated() {
      this.order_detacher();
      this.order_detacher = db
        .collection(`restaurants/${this.restaurantId()}/orders`)
        .where("timePlaced", ">=", this.today)
        // .where("timePlaced", "<", this.tommorow)
        .where("status", "==", order_status.order_placed)
        .onSnapshot(
          (result) => {
            this.orders = result.docs.map(this.doc2data("order"));
            this.$store.commit("setOrders", this.orders);
          },
          (error) => {
            if (error.code === "permission-denied") {
              // We can ignore this type of error here
              console.warn("Ignoring", error.code);
            } else {
              throw error;
            }
          }
        );
    },
  },
};
</script>
