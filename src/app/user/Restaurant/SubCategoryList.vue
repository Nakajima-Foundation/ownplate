<template>
  <div>
    <template v-for="(subcategory, key) in subCategoryData">
      <router-link
        :to="`${categoryBathPath}/${subcategory.id}`"
        class="inline-flex justify-center items-center h-9 rounded-full bg-black bg-opacity-5 mx-1 mt-2"
      >
        <div class="text-sm font-bold text-op-teal mr-2">
          <i
            style="font-size: 1rem"
            class="material-icons ml-2 text-op-teal text-sm inline-flex text-center"
            v-if="subCategoryId === subcategory.id"
            >check</i
          >
          <span class="ml-2" v-else></span>
          <span class="inline-flex text-center">{{ subcategory.name }}</span>
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
