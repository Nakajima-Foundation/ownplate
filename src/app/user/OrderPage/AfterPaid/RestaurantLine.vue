<template>
  <div class="mx-6 mt-6 rounded-lg bg-black bg-opacity-5 p-4 text-center">
    <a target="_blank" :href="shopInfo.lineUrl" rel="noopener noreferrer">
      <div
        class="inline-flex h-12 items-center justify-center rounded-full px-6"
        style="background: #18b900"
      >
        <i class="fab fa-line mr-2 text-2xl text-white" />
        <div class="text-base font-bold text-white">
          {{ $t("order.lineLink") }}
        </div>
      </div>
    </a>

    <div class="mt-2 text-sm">
      {{ $t("order.lineMessage") }}
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
