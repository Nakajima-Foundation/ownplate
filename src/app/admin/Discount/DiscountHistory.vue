<template>
  <div>
    <div v-for="(h, k) in histories" :key="k">
      {{h.uid}}
      {{h.restaurantId}}
      {{h.promotionId}}
      {{h.usedAt.toDate()}}
    </div>
  </div>
</template>
    

<script lang="ts">
import {
  defineComponent,
  ref,
} from "@vue/composition-api";

import { db } from "@/lib/firebase/firebase9";
import {
  getDocs,
  query,
  collectionGroup,
  where,
  orderBy,
} from "firebase/firestore";


export default defineComponent({
  props: {
    isInMo: {
      type: Boolean,
      required: false,
    },
    moPrefix: {
      type: String,
      required: false,
    },
    shopInfo: {
      type: Object,
      required: false,
    },
  },
  setup(props, ctx) {

    const id = props.isInMo ? props.moPrefix : props.shopInfo?.restaurantId;
    const idKey = props.isInMo ? "groupId" : "restaurantId";

    const histories = ref<any[]>([]);

    getDocs(query(
      collectionGroup(db, "promotionHistories"),
      where(idKey, "==", id),
      orderBy("createdAt", "desc"),
    )).then((docs) => {
      const tmp: any[] = [];
      docs.docs.map((a) => {
        tmp.push(a.data());
      });
      histories.value = tmp;
    });
    return {
      histories,
    };
  },
});

</script>

