<template>
  <div
    class="mt-6 mx-6 bg-black bg-opacity-5 rounded-lg p-4 text-center"
    >
    <a target="_blank" :href="shopInfo.lineUrl">
      <div
        class="inline-flex justify-center items-center h-12 px-6 rounded-full"
        style="background: #18b900"
        >
        <i class="fab fa-line text-2xl text-white mr-2" />
        <div class="text-base font-bold text-white">
          {{ $t("order.lineLink") }}
        </div>
      </div>
    </a>
    
    <div class="text-sm mt-2">
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
