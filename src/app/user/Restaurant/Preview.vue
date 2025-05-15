<template>
  <div v-if="isPreview" class="bg-red-700/10 p-4 text-center">
    <div class="text-base font-bold text-red-700">
      {{ $t("shopInfo.thisIsPreview") }}
    </div>
    <div class="text-base font-bold text-red-700">
      {{ $t("shopInfo.notPublic") }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

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
