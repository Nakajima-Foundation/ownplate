<template>
  <div>
    <div class="flex h-12 justify-between py-2 pl-6 pr-4">
      <span class="text-xl font-bold text-black text-opacity-30">
        <router-link
          :to="
            basePath + '/r/' + restaurantId() + '/categories/' + howtoreceive
          "
        >
          {{ $t("shopInfo.productCategory") }}
        </router-link>
      </span>
    </div>
    <div class="mx-6">
      {{ selectedCategory.name }}
    </div>
    <div class="mt-2 items-center">
      <div v-for="(cat, k) in subCategoryData" :key="k">
        <router-link
          :to="
            basePath +
            '/r/' +
            restaurantId() +
            '/cat/' +
            category +
            '/' +
            cat.id +
            '/' +
            howtoreceive
          "
        >
          <div>
            <div class="flex items-center">
              <div
                class="ml-8 mt-2 flex-1 text-xs font-bold leading-tight text-op-teal"
              >
                {{ cat.name }}
              </div>
            </div>
          </div>
        </router-link>
      </div>
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
    selectedCategory: {
      type: Object,
      required: false,
    },
    subCategoryData: {
      type: Array,
      required: false,
    },
    howtoreceive: {
      type: String,
      required: true,
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
