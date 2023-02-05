<template>
<div>
  <div v-for="(log, k) in logs" :key="k">
    {{ log.date }}/
    {{ log.hour }}/
    {{ log.pageviews }}
  </div>
</div>
</template>

<script type="ts">
import {
  defineComponent,
  ref,
} from "@vue/composition-api";

import { db } from "@/lib/firebase/firebase9";
import { doc, getDocs, query, collectionGroup, where } from "firebase/firestore";


export default defineComponent({
  setup(_, ctx) {
    const restaurantId = ctx.root.$route.params.restaurantId;

    const logs = ref([]);
    
    getDocs(
      query(
        collectionGroup(db, "pageViewData"),
        where("restaurantId", "==", restaurantId),
        where("month", "==", "202301")
      )
    ).then((logCollection) => {
      logs.value = logCollection.docs.map(logDoc => logDoc.data());
    });
    
    return {
      logs,
    };
  }

});
</script>
