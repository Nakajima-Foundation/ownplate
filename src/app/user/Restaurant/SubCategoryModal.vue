<template>
  <div class="m-4">
    <router-link
      :to="basePath + '/r/' + restaurantId() + '/categories/' + howtoreceive"
    >
      <div
        class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
      >
        <i class="material-icons text-op-teal">list</i>
        <span class="ml-1 text-sm font-bold text-op-teal">
          {{ $t("shopInfo.productCategory") }}
        </span>
      </div></router-link
    >
    <div class="mt-6 font-bold text-black text-opacity-30">
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
          <div
            class="mt-2 inline-flex items-center p-2 text-sm font-bold text-op-teal"
          >
            <i
              v-if="selectedSubCategory == cat.id"
              style="font-size: 1rem"
              class="material-icons mr-1"
              >check_circle</i
            >
            <div>{{ cat.name }}</div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed } from "vue";
import { useBasePath, smallImageErrorHandler } from "@/utils/utils";
import { moBaseUrl } from "@/config/project";
import { useRoute } from "vue-router";

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
  const route = useRoute();
    const basePath = useBasePath();
    const { category, selectedSubCategory } = route.params;
    return {
      basePath,
      moBaseUrl,
      smallImageErrorHandler,
      category,
      selectedSubCategory,
    };
  },
});
</script>
