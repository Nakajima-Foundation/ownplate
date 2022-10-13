<template>
  <div>
    <template v-for="(subcategory, key) in subCategoryData">
      <router-link
        :to="`${categoryBathPath}/${subcategory.id}`"
        class="mx-1 mt-2 inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5"
      >
        <div class="mr-2 text-sm font-bold text-op-teal">
          <i
            style="font-size: 1rem"
            class="material-icons ml-2 inline-flex text-center text-sm text-op-teal"
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
