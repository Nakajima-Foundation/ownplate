<template>
  <div
    class="grid grid-cols-2 items-center gap-3 lg:grid-cols-3 xl:grid-cols-4"
  >
    <div v-for="(cat, k) in subCategoryData" :key="k">
      <router-link
        :to="
          basePath +
          '/r/' +
          restaurantId() +
          '/cat/' + category + '/' +
          cat.id 
        "
      >
        <div @click="closeCategory">
          <div class="flex items-center">
            <div
              class="mt-2 mr-2 h-10 w-10 rounded-lg border-gray-100 bg-white shadow-none"
            >
              <img
                :src="moBaseUrl + '/images/category/' + cat.id + '.jpg'"
                @error="smallImageErrorHandler"
                class="inline-block rounded-lg align-middle"
              />
            </div>
            <div
              class="mt-2 flex-1 text-xs font-bold leading-tight text-op-teal"
            >
              {{ cat.name }}
            </div>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed } from "@vue/composition-api";
import { useBasePath, smallImageErrorHandler } from "@/utils/utils";
import { moBaseUrl } from "@/config/project";

export default defineComponent({
  name,
  props: {
    categoryData: {
      type: Array,
      required: true,
    },
    subCategoryData: {
      type: Array,
      required: false,
    },
  },
  setup(props, ctx) {
    const basePath = useBasePath(ctx.root);
    const category = ctx.root.$route.params.category;
    
    return {
      basePath,
      moBaseUrl,
      smallImageErrorHandler,
      category,
    };
  },
});

</script>
