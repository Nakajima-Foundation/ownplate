<template>
<div>
  あと<span class="text-green-600">
    {{ $n( promotion.discountThreshold - totalPrice.total, "currency") }}
  </span>
  購入すると
  <template v-if="promotion.discountMethod === 'amount'">
    {{ $n(promotion.discountValue, "currency") }}値引き
  </template>
  <template v-if="promotion.discountMethod === 'ratio'">
    {{ promotion.discountValue }}% 値引き
  </template>

</div>
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
    totalPrice: {
      type: Object,
      required: true,
    },
  }
});
</script>
