<template>
<div class="mx-6 mt-2 lg:mx-0">
  <template v-for="(subcategory, key) in subCategoryData">
    <router-link
      :to="`${categoryBathPath}/${subcategory.id}`"
      class="inline-flex justify-center items-center h-9 rounded-full bg-black bg-opacity-5 mx-2 mt-2"
      >
      <div class="text-sm font-bold text-op-teal mx-2">
        {{ subcategory.name }}
      </div>
    </router-link>
  </template>
</div>
</template>

<script>
import {
  defineComponent,
} from "@vue/composition-api";

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
  }
});
</script>
