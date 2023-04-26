<template>
  <span>
    <template v-if="promotion.paymentRestrictions === 'stripe'">
      事前クレジットカード決済で
    </template>
    <template v-if="promotion.paymentRestrictions === 'instore'">
      受取時に店舗でお支払いで
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
