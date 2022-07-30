<template>
  <div>
    <div v-if="groupMasterRestaurant === undefined" />
    <router-view
      v-else
      :groupData="groupData"
      :groupMasterRestaurant="groupMasterRestaurant"
      :isInMo="isInMo"
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
    if (true) {
      getDoc(doc(db, "/groups/ss")).then((a) => {
        groupData.value = a.exists() ? a.data() : null;
        if (groupData.value) {
          onSnapshot(
            doc(db, `restaurants/${groupData.value.restaurantId}`),
            (result) => {
              groupMasterRestaurant.value = result.data() as any;
            }
          );
        }
      });
    } else {
      groupMasterRestaurant.value = { empty: true };
    }
    return {
      isInMo,
      groupData,
      groupMasterRestaurant,
    };
  },
});
</script>
