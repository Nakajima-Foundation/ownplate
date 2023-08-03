<template>
  <div>
    <MoSuspend
      :isSuspendAllOrder="groupData.isSuspendAllOrder || false"
      :isSuspendPickup="groupData.isSuspendPickup || false"
      :isAllShop="true"
      @resetSuspend="resetSuspend"
      @setAllOrderSuspend="setAllOrderSuspend"
      @setPickupSuspend="setPickupSuspend"
    />
  </div>
</template>

<script>
import { defineComponent, computed, ref } from "@vue/composition-api";
import { db } from "@/lib/firebase/firebase9";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

import MoSuspend from "@/app/admin/MoSuspend.vue";

export default defineComponent({
  components: {
    MoSuspend,
  },
  setup(props, ctx) {
    const groupData = ref({});
    const groupPath = computed(() => {
      const groupId = ctx.root.$store.getters.grpupId;
      return `groups/${groupId}/groupConfig/suspend`;
    });

    onSnapshot(doc(db, groupPath.value), (a) => {
      groupData.value = a.data() || {};
    });

    const resetSuspend = () => {
      setDoc(doc(db, groupPath.value), {
        isSuspendAllOrder: false,
        isSuspendPickup: false,
      });
    };
    const setAllOrderSuspend = () => {
      setDoc(doc(db, groupPath.value), {
        isSuspendAllOrder: true,
        isSuspendPickup: false,
      });
    };
    const setPickupSuspend = () => {
      setDoc(doc(db, groupPath.value), {
        isSuspendAllOrder: false,
        isSuspendPickup: true,
      });
    };

    return {
      groupData,
      resetSuspend,
      setAllOrderSuspend,
      setPickupSuspend,
    };
  },
});
</script>
