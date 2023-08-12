<template>
  <div>
    <div v-for="(discount, k) in discountHistory" :key="k">
      {{ discount?.userHistory?.usedAt.toDate().toISOString().slice(0, 10) }}
      {{ discount?.history?.promotionName }}
    </div>
  </div>
</template>
    

<script lang="ts">
import {
  defineComponent,
  computed,
} from "vue";
import { useRoute } from "vue-router";

import {
  useUserData,
} from "@/utils/utils";

import {
  useUserPromotionHistory
} from "@/utils/promotion";

export default defineComponent({
  setup() {
    const route = useRoute();

    const { user } = useUserData();

    // TODO: fix restaurant path is not set
    const restaurantId = computed(() => {
      return route.params.restaurantId as string;
    });
    
    const id = restaurantId.value;
    const { discountHistory } = useUserPromotionHistory(id, user);
    return {
      discountHistory
    };
  },
});

</script>
