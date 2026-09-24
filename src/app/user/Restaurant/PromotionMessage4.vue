<template>
  <span>
    {{ $n(promotion.discountThreshold, "currency") }}(税込)以上のご購入
  </span>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import type Promotion from "@/models/promotion";

export default defineComponent({
  props: {
    promotion: {
      type: Object as PropType<Promotion>,
      required: true,
    },
  },
});
</script>
