<template>
  <div class="grid grid-cols-3">
    <div v-for="(cat, k) in categoryData" :key="k">
      <div class="m-auto w-full text-center">
        <router-link
          :to="
            basePath +
            '/r/' +
            restaurantId() +
            '/cat/' +
            cat.id +
            '/' +
            cat.subcategory
          "
        >
          <div @click="closeCategory">
            <span>{{ cat.name }}</span>
            <img src="/android-chrome-192x192.png" class="w-12 m-auto" />
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed } from "@vue/composition-api";
import { useBasePath } from "@/utils/utils";

export default defineComponent({
  props: {
    categoryData: {
      type: Array,
      required: true,
    },
  },
  emits: ["closeGroupCategory"],
  setup(props, ctx) {
    const basePath = useBasePath(ctx.root);

    const closeCategory = () => {
      ctx.emit("closeGroupCategory");
    };
    return {
      basePath,
      closeCategory,
    };
  },
});
</script>
