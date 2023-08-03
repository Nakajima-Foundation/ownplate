<template>
  <span>
    {{ $n(promotion.discountThreshold, "currency") }}(税込)以上のご購入
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
