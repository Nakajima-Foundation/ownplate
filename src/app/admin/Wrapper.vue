<template>
<div>
  <div v-if="groupMasterRestaurant===undefined"/>
  <router-view v-else
               :groupData="groupData"
               :groupMasterRestaurant="groupMasterRestaurant"
               />
</div>
</template>
  
<script lang="ts">
import {
  defineComponent,
  ref,
} from "@vue/composition-api";
import { db } from "@/lib/firebase/firebase9";
import { doc, getDoc, onSnapshot, query, DocumentData } from "firebase/firestore";

export default defineComponent({
  setup(_, ctx) {
    const groupData = ref();
    const groupMasterRestaurant = ref();

    if (true) {
      getDoc(doc(db, "/groups/ss")).then((a) => {
        groupData.value = a.exists() ? a.data() : null;
        if (groupData.value) {
          onSnapshot(
            doc(db, `restaurants/${groupData.value.restaurantId}`),
            (result) => {
              groupMasterRestaurant.value = result.data() as any;
            },
          )
        }
      });
                                        
    }
    return {
      groupData,
      groupMasterRestaurant,
    };
  }
});
</script>
