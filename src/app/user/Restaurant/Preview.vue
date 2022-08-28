<template>
  <div v-if="isPreview" class="bg-red-700 bg-opacity-10 text-center p-4">
    <div class="text-base font-bold text-red-700">
      {{ $t("shopInfo.thisIsPreview") }}
    </div>
    <div class="text-base font-bold text-red-700">
      {{ $t("shopInfo.notPublic") }}
    </div>
  </div>
</template>

<script>
import { defineComponent } from "@vue/composition-api";

export default defineComponent({
  name: "RestaurantPreviewPage",
  props: {
    isPreview: {
      type: Boolean,
      required: true,
    },
  },
});
</script>
