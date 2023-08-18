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
import {
  defineComponent,
} from "vue";

export default defineComponent({
  props: {
    promotion: {
      type: Object,
      required: true,
    },
  }
});
</script>
