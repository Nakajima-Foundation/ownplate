<template>
  <router-link
    :to="
      basePath +
      '/r/' +
      restaurantId +
      (selectedCategory.subCategoryCounter > 1
        ? `/category/${selectedCategory.id}/${subCategory}/${howtoreceive}`
        : `/categories/${howtoreceive}`)
    "
  >
    <div
      class="fixed bottom-24 left-4 right-4 z-10 mx-auto mb-2 inline-flex h-12 max-w-lg cursor-pointer items-center rounded-full bg-white p-2 shadow-lg sm:bottom-28"
    >
      <div
        class="inline-flex w-28 items-center justify-center rounded-full bg-op-teal bg-opacity-10 p-1"
      >
        <i class="material-icons ml-0.5 text-2xl text-op-teal">tune</i>
        <div class="ml-0.5 text-xs font-bold text-op-teal">
          {{ $t("button.category") }}
        </div>
      </div>
      <div class="ml-2 text-sm font-bold line-clamp-1">
        {{ selectedSubCategory.name }}
      </div>
    </div>
  </router-link>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useBasePath, getRestaurantId } from "@/utils/utils";

export default defineComponent({
  props: {
    howtoreceive: {
      type: String,
      required: true,
    },
    selectedCategory: {
      type: Object,
      required: true,
    },
    selectedSubCategory: {
      type: Object,
      required: true,
    },
    subCategory: {
      type: String,
      required: true,
    },
  },
  setup() {
    const basePath = useBasePath();
    const restaurantId = getRestaurantId();

    return {
      basePath,
      restaurantId,
    };
  },
});
</script>
