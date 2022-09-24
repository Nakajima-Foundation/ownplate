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
