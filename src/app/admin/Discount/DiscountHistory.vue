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
    const route = ctx.root.$route;

    const id = props.isInMo ? props.moPrefix : props.shopInfo?.restaurantId;
    const idKey = props.isInMo ? "groupId" : "restaurantId";
    const discountId = route.params.discountId as string;

    const histories = ref<any[]>([]);
    const cond = discountId ?
      query(
        collectionGroup(db, "promotionHistories"),
        where(idKey, "==", id),
        where("promotionId", "==", discountId),
      ) :
      query(
        collectionGroup(db, "promotionHistories"),
        where(idKey, "==", id)
      );
    const q = query(
      cond,
      orderBy("createdAt", "desc"),
    );
    getDocs(q).then((docs) => {
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

