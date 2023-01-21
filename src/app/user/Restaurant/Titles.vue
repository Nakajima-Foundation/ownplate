<template>
  <div class="mx-6 lg:mx-0">
    <template v-for="(title, key) in titleLists">
      <a
        :href="`#${title.id}`"
        class="mx-2 mt-2 inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5"
      >
        <div class="mx-2 text-sm font-bold text-op-teal">
          {{ title.name }}
        </div>
      </a>
    </template>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    titleLists: {
      type: Array,
      required: true,
    },
  },
});
</script>
