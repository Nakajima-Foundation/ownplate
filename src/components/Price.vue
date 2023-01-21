<template>
  <span>
    <span>
      {{ $tc("tax.price", $n(price, "currency")) }}
      <span class="text-xs">{{ $tc("tax.include") }}</span>
      <br />
    </span>
  </span>
</template>

<script>
import { defineComponent, computed } from "vue";

import { priceWithTax } from "@/utils/utils";

export default defineComponent({
  name: "Price",
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
    menu: {
      type: Object,
      required: true,
    },
  },
  setup(props, ctx) {
    const price = computed(() => {
      return priceWithTax(props.shopInfo, props.menu);
    });

    return {
      price,
    };
  },
});
</script>
