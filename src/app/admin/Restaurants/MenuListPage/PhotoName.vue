<template>
  <div class="flex items-center">
    <div class="mr-4 flex-shrink-0 rounded-full bg-black bg-opacity-10">
      <img
        :src="resizedProfileImage(shopInfo, '600')"
        class="h-9 w-9 rounded-full object-cover"
      />
    </div>
    <div class="text-base font-bold">
      {{ shopInfo.restaurantName }}
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { resizedProfileImage } from "@/utils/utils";

export default defineComponent({
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
  },
  setup() {
    return {
      resizedProfileImage,
    };
  },
});
</script>
