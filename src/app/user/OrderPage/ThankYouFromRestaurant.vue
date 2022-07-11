<template>
  <div
    class="mt-4 mx-6 bg-white rounded-lg p-4 shadow"
    v-if="shopInfo && shopInfo.orderThanks && shopInfo.orderThanks.length > 0"
  >
    <div class="text-xs font-bold text-black text-opacity-60">
      {{ $t("order.thanksMessage") }}
    </div>
    <div
      class="mt-2 text-base"
      :class="shopInfo.enablePreline ? 'whitespace-pre-line' : ''"
    >
      {{ shopInfo.orderThanks }}
    </div>
  </div>
</template>

<script>
import { defineComponent } from "@vue/composition-api";
export default defineComponent({
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
  },
});
</script>
