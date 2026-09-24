<template>
  <span>
    <template v-if="promotion.discountMethod === 'amount'">
      {{ $n(promotion.discountValue, "currency") }}値引き
    </template>
    <template v-if="promotion.discountMethod === 'ratio'">
      {{ promotion.discountValue }}% 値引き
    </template>
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
