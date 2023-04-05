<template>
  <div>
    <div v-for="(h, k) in histories" :key="k">
      uid: {{h.uid}}<br/>
      rid: {{h.restaurantId}}<br/>
      pid: {{h.promotionId}}<br/>
      oid: {{h.orderId}}<br/>
      date: {{h.usedAt.toDate()}}<br/>
      total: {{h.totalCharge}}<br/>
      discount: {{h.discountPrice}}<br/>
      <hr class="h-1 bg-gray-200 border-0 left-1/2 dark:bg-gray-900"/>

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

