<template>
  <div
    class="flex justify-between items-center space-x-2 lg:max-w-2xl lg:mx-auto h-14 mx-6 mt-6 py-4 pl-4 pr-6 bg-black bg-opacity-5 rounded-full"
  >
    <div class="flex items-center space-x-2">
      <i class="material-icons text-2xl text-black text-opacity-50">tune</i>
      <div class="text-black font-bold text-sm text-opacity-50">
        {{ selectedCategory.name }}
      </div>
    </div>
    <div class="min-w-fit text-sm font-bold text-op-teal">
      <router-link :to="`/admin/restaurants/${shopInfo.restaurantId}/menus`">
        {{ $t("editMenu.selectCategory") }}
      </router-link>
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
    selectedCategory: {
      type: Object,
      required: true,
    },
  },
});
</script>
