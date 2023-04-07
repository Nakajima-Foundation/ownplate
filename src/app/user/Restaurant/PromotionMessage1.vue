<template>
  <span>
    {{ $n(promotion.discountThreshold, "currency") }}(税込)以上のご利用
    <template v-if="promotion.paymentRestrictions === 'stripe'">
      &事前クレジット決済
    </template>
    <template v-if="promotion.paymentRestrictions === 'instore'">
      &現地払い
    </template>
    で
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
