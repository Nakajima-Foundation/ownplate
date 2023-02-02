<template>
  <div
    class="mx-6 mt-4 rounded-lg bg-white p-4 shadow"
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

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
  },
});
</script>
