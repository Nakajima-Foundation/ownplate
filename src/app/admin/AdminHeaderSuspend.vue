<template>
  <div>
    <MoSuspend
      :isSuspendAllOrder="shopInfo.isSuspendAllOrder || false"
      :isSuspendPickup="shopInfo.isSuspendPickup || false"
      :isAllShop="false"
      @resetSuspend="resetSuspend"
      @setAllOrderSuspend="setAllOrderSuspend"
      @setPickupSuspend="setPickupSuspend"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { db } from "@/lib/firebase/firebase9";
import { doc, updateDoc } from "firebase/firestore";
import {
  useRestaurantId
} from "@/utils/utils";

import MoSuspend from "@/app/admin/MoSuspend.vue";

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
    const restaurantId = useRestaurantId();
    const resetSuspend = () => {
      updateDoc(doc(db, `restaurants/${restaurantId.value}`), {
        isSuspendAllOrder: false,
        isSuspendPickup: false,
      });
    };
    const setAllOrderSuspend = () => {
      updateDoc(doc(db, `restaurants/${restaurantId.value}`), {
        isSuspendAllOrder: true,
      });
    };
    const setPickupSuspend = () => {
      updateDoc(doc(db, `restaurants/${restaurantId.value}`), {
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
