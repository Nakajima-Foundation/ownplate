<template>
  <div>
    hello
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
} from "@vue/composition-api";

export default defineComponent({
  setup(props, ctx) {
    const route = ctx.root.$route;
    const router = ctx.root.$router;
    const discountId = route.params.discountId as string;

    const id = props.isInMo ? props.moPrefix : props.shopInfo?.restaurantId;
    const promotion = ref<PromotionData|null>(null);

    
    getPromotion(props.isInMo, id as string, discountId).then(data => {
      promotion.value = data;
    });

    // promotionsHistories

  },
});
</script>
