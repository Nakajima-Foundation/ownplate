<template>
  <router-link
    :to="
      basePath +
      '/r/' +
      restaurantId() +
      (selectedCategory.subCategoryCounter > 1
        ? `/category/${selectedCategory.id}/${howtoreceive}`
        : `/categories/${howtoreceive}`)
    "
  >
    <div
      class="fixed left-4 bottom-24 z-10 inline-flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-full border-2 border-op-teal bg-teal-50 pb-1.5 shadow-lg sm:bottom-28"
    >
      <i class="material-icons mb-0.5 text-2xl text-op-teal">tune</i>
      <div class="text-xs font-bold text-op-teal">
        {{ $t("button.category") }}
      </div>
    </div>
    <!-- {{selectedCategory.name}} -->
  </router-link>
</template>

<script>
import { defineComponent } from "@vue/composition-api";
import { useBasePath } from "@/utils/utils";

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
  },
  setup(props, ctx) {
    const basePath = useBasePath(ctx.root);
    return {
      basePath,
    };
  },
});
</script>
