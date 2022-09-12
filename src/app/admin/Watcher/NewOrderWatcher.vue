<template></template>

<script>
import {
  defineComponent,
  watch,
  computed,
  ref,
  onUnmounted,
} from "@vue/composition-api";

import { db, firestore } from "@/plugins/firebase";
import { midNight } from "@/utils/dateUtils";
import { order_status } from "@/config/constant";

import { doc2data } from "@/utils/utils";

export default defineComponent({
  props: {
    notificationConfig: Object,
  },
  setup(props, ctx) {
    // intervalTime was 60
    const restaurantId = ctx.root.restaurantId();
    const intervalTime = [
      "OQBBSOa3CgEv35smSDVK", // debug
      "GiZEOBRwDGmdpuqKKlyq",
      "KNfeQdS7DM07ObWlZTsn",
    ].includes(restaurantId)
      ? 4
      : 60;

    const orders = ref([]);

    const today = computed(() => {
      return midNight(0);
    });
    const tommorow = computed(() => {
      return midNight(1);
    });
    const hasNewOrder = computed(() => {
      return orders.value.length > 0;
    });

    let order_detacher = null;
    const dateWasUpdated = () => {
      if (order_detacher) {
        order_detacher();
      }
      order_detacher = db
        .collection(`restaurants/${restaurantId}/orders`)
        .where("timePlaced", ">=", today.value)
        // .where("timePlaced", "<", this.tommorow)
        .where("status", "==", order_status.order_placed)
        .onSnapshot(
          (result) => {
            orders.value = result.docs.map(doc2data("order"));
            ctx.root.$store.commit("setOrders", orders.value);
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
    };

    dateWasUpdated();

    const itSound = () => {
      console.log(
        "newOrderWatcher: conf=" +
          props.notificationConfig.infinityNotification +
          " order=" +
          hasNewOrder.value
      );
      if (props.notificationConfig.infinityNotification && hasNewOrder.value) {
        ctx.root.soundPlay("NewOrderWatcher: play");
      }
    };
    const intervalTask = setInterval(() => {
      itSound();
      // }, 1000 * 3); // debug
    }, 1000 * intervalTime);

    onUnmounted(() => {
      order_detacher();
      clearInterval(intervalTask);
    });
    watch(today, () => {
      dateWasUpdated();
    });
  },
});
</script>
