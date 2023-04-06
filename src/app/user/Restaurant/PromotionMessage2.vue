<template>
  <span>
    <template v-if="promotion.discountMethod === 'amount'">
      {{ $n(promotion.discountValue, "currency") }}値引きキャンペーン実施中！
    </template>
    <template v-if="promotion.discountMethod === 'ratio'">
      {{ promotion.discountValue }}% 値引きキャンペーン実施中！
    </template>
  </span>
</template>


<script lang="ts">
import {
  defineComponent,
} from "@vue/composition-api";

export default defineComponent({
  props: {
    promotion: {
      type: Object,
      required: true,
    },
  }
});
</script>
