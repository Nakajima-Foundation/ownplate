<template>
  <div />
</template>

<script lang="ts">
import { defineComponent, watch, computed, ref, onUnmounted } from "vue";

import { db } from "@/lib/firebase/firebase9";
import { collection, onSnapshot, where, query } from "firebase/firestore";

import { midNight } from "@/utils/dateUtils";
import { order_status } from "@/config/constant";

import { doc2data, useRestaurantId, useSoundPlay } from "@/utils/utils";
import { OrderInfoData } from "@/models/orderInfo";
import { useGeneralStore } from "@/store";

export default defineComponent({
  props: {
    notificationConfig: Object,
  },
  setup(props) {
    const generalStore = useGeneralStore();

    // intervalTime was 60
    const restaurantId = useRestaurantId();
    const intervalTime = [
      "OQBBSOa3CgEv35smSDVK", // debug
      "GiZEOBRwDGmdpuqKKlyq",
      "KNfeQdS7DM07ObWlZTsn",
    ].includes(restaurantId.value)
      ? 4
      : 60;

    const orders = ref<OrderInfoData[]>([]);

    const today = computed(() => {
      return midNight(0);
    });
    const hasNewOrder = computed(() => {
      return orders.value.length > 0;
    });

    let order_detacher: any = null;
    const dateWasUpdated = () => {
      if (order_detacher) {
        order_detacher();
      }
      order_detacher = onSnapshot(
        query(
          collection(db, `restaurants/${restaurantId.value}/orders`),
          where("timePlaced", ">=", today.value),
          // .where("timePlaced", "<", this.tommorow)
          where("status", "==", order_status.order_placed),
        ),
        (result) => {
          orders.value = result.docs.map(doc2data("order")) as OrderInfoData[];
          generalStore.setOrders(orders.value);
        },
        (error) => {
          if (error.code === "permission-denied") {
            // We can ignore this type of error here
            console.warn("Ignoring", error.code);
          } else {
            throw error;
          }
        },
      );
    };

    dateWasUpdated();

    const soundPlay = useSoundPlay();
    const itSound = () => {
      console.log(
        "newOrderWatcher: conf=" +
          props?.notificationConfig?.infinityNotification +
          " order=" +
          hasNewOrder.value,
      );
      if (
        props?.notificationConfig?.soundOn &&
        props?.notificationConfig?.infinityNotification &&
        hasNewOrder.value
      ) {
        soundPlay("NewOrderWatcher: play");
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
