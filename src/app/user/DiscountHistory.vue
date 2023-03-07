<template>
  <div>
    <div v-for="(discount, k) in discountHistory" :key="k">
      {{ discount.userHistory.usedAt.toDate().toISOString().slice(0, 10) }}
      {{ discount.history.promotionName }}
    </div>
  </div>
</template>
    

<script lang="ts">
import {
  defineComponent,
  computed,
} from "@vue/composition-api";

import { useIsInMo } from "@/utils/utils";

import {
  useUserPromotionHistory
} from "./promotion";

export default defineComponent({
  props: {
    moPrefix: {
      type: String,
      required: false,
    },
  },
  setup(props, ctx) {
    const isInMo = useIsInMo(ctx.root);
    const route = ctx.root.$route;

    const user = computed(() => {
      // @ts-ignore
      return ctx.root.user;
    });
    const restaurantId = computed(() => {
      return route.params.restaurantId as string;
    });
    
    const id = isInMo.value ? props.moPrefix as string : restaurantId.value;
    const { discountHistory } = useUserPromotionHistory( isInMo.value ? 'mo' : '' , id, user);
    return {
      discountHistory
    };
  },
});

</script>
