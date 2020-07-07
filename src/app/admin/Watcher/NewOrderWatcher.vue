<template></template>

<script>
import { db, firestore } from "~/plugins/firebase.js";
import { midNight } from "~/plugins/dateUtils.js";
import { order_status } from "~/plugins/constant.js";

export default {
  props: {
    notificationConfig: Object
  },
  data() {
    return {
      order_detacher: () => {},
      orders: [],
      intervalTask: {},
      intervalTime: 60 // (seconds)
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
    }
  },
  watch: {
    today() {
      this.dateWasUpdated();
    }
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
          result => {
            this.orders = result.docs.map(this.doc2data("order"));
            this.$store.commit("setOrders", this.orders);
          },
          error => {
            if (error.code === "permission-denied") {
              // We can ignore this type of error here
              console.warn("Ignoring", error.code);
            } else {
              throw error;
            }
          }
        );
    }
  }
};
</script>
