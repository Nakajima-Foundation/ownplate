<template>
  <div>
    <MoSuspend
      :isSuspendAllOrder="shopInfo.isSuspendAllOrder"
      :isSuspendPickup="shopInfo.isSuspendPickup"
      @resetSuspend="resetSuspend"
      @setAllOrderSuspend="setAllOrderSuspend"
      @setPickupSuspend="setPickupSuspend"
    />
  </div>
</template>

<script>
import { defineComponent, computed, ref } from "@vue/composition-api";
import { db } from "@/lib/firebase/firebase9";
import { doc, updateDoc } from "firebase/firestore";

import MoSuspend from "./MoSuspend.vue";

export default defineComponent({
  components: {
    MoSuspend,
  },
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
  },
  setup(props, ctx) {
    const resetSuspend = () => {
      updateDoc(doc(db, `restaurants/${ctx.root.restaurantId()}`), {
        isSuspendAllOrder: false,
        isSuspendPickup: false,
      });
    };
    const setAllOrderSuspend = () => {
      updateDoc(doc(db, `restaurants/${ctx.root.restaurantId()}`), {
        isSuspendAllOrder: true,
      });
    };
    const setPickupSuspend = () => {
      updateDoc(doc(db, `restaurants/${ctx.root.restaurantId()}`), {
        isSuspendPickup: true,
      });
    };

    return {
      resetSuspend,
      setAllOrderSuspend,
      setPickupSuspend,
    };
  },
});
</script>
