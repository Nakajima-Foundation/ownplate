<template>
  <div class="mx-6 mt-2 lg:mx-0">
    <template v-for="(subcategory, key) in subCategoryData">
      <router-link
        :to="`${categoryBathPath}/${subcategory.id}`"
        class="inline-flex justify-center items-center h-9 rounded-full bg-white mr-4 mt-2 px-1"
        >
        <i class="material-icons ml-2 text-op-teal" v-if="subCategoryId === subcategory.id">check</i>
        <div class="text-sm font-bold text-op-teal mr-2">
          {{ subcategory.name }}
        </div>
      </router-link>
    </template>
  </div>
</template>

<script>
import { defineComponent } from "@vue/composition-api";

export default defineComponent({
  props: {
    subCategoryData: {
      type: Array,
      required: true,
    },
    categoryBathPath: {
      type: String,
      required: true,
    },
    subCategoryId: { 
      type: String,
      required: true,
    },
  },
});
</script>
