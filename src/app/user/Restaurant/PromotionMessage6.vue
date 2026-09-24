<template>
  <span>
    <template v-if="promotion.paymentRestrictions === 'stripe'">
      「オンライン支払いで注文」で
    </template>
    <template v-if="promotion.paymentRestrictions === 'instore'">
      「受け取り払いで注文」で
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
