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
import { defineComponent, ref, computed } from "@vue/composition-api";
import { db } from "@/lib/firebase/firebase9";
import {
  doc,
  getDoc,
  onSnapshot,
  query,
  DocumentData,
} from "firebase/firestore";

export default defineComponent({
  setup(_, ctx) {
    const groupData = ref();
    const groupMasterRestaurant = ref();

    const isInMo = computed(() => {
      return !groupMasterRestaurant.value.empty;
    });
    const moPrefix = computed(() => {
      return "ss";
    });
    if (moPrefix.value) {
      getDoc(doc(db, `/groups/${moPrefix.value}`)).then((a) => {
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
