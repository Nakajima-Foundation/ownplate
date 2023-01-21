<template>
  <div>
    <div v-if="groupMasterRestaurant === undefined" />
    <router-view
      v-else
      :groupData="groupData"
      :groupMasterRestaurant="groupMasterRestaurant"
      :isInMo="isInMo"
      :moPrefix="moPrefix"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import { db } from "@/lib/firebase/firebase9";
import { doc, onSnapshot } from "firebase/firestore";

export default defineComponent({
  setup(_, ctx) {
    const groupData = ref();
    const groupMasterRestaurant = ref();

    const moPrefix = computed(() => {
      return ctx.root.$store.getters.grpupId;
    });
    const isInMo = computed(() => {
      return !!moPrefix.value;
    });
    if (moPrefix.value) {
      onSnapshot(doc(db, `/groups/${moPrefix.value}`), (a) => {
        if (a.exists()) {
          groupData.value = a.data();
          if (groupData.value) {
            onSnapshot(
              doc(db, `restaurants/${groupData.value.restaurantId}`),
              (result) => {
                groupMasterRestaurant.value = result.data() as any;
              }
            );
          }
        } else {
          groupMasterRestaurant.value = { empty: true };
        }
      });
    } else {
      groupMasterRestaurant.value = { empty: true };
    }
    return {
      isInMo,
      moPrefix,
      groupData,
      groupMasterRestaurant,
    };
  },
});
</script>
