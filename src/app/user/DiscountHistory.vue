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
  useIsInMo,
  useUserData,
} from "@/utils/utils";

import {
  useUserPromotionHistory
} from "@/utils/promotion";

export default defineComponent({
  props: {
    moPrefix: {
      type: String,
      required: false,
    },
  },
  setup(props, ctx) {
    const isInMo = useIsInMo();
    const route = useRoute();

    const { user } = useUserData();

    // TODO: fix restaurant path is not set
    const restaurantId = computed(() => {
      return route.params.restaurantId as string;
    });
    
    const id = isInMo.value ? props.moPrefix as string : restaurantId.value;
    const { discountHistory } = useUserPromotionHistory(id, user);
    return {
      discountHistory
    };
  },
});

</script>
