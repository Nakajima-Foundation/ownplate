<template>
  <div>
    
  </div>
</template>
    

<script lang="ts">
import {
  defineComponent,
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
    getDocs(query(
      collectionGroup(db, "promotionHistories"),
      where(idKey, "==", id),
      orderBy("createdAt", "desc"),
    ))
    return {
      
    };
  },
});

</script>

