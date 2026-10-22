<template>
  <router-link
    :to="'/admin/news/' + id"
    class="block rounded-lg bg-white px-4 py-3 shadow-sm"
  >
    <div class="flex items-baseline justify-between">
      <div class="text-sm font-bold text-black/30">{{ date }}</div>
      <div
        v-if="version"
        class="rounded-full bg-black/5 px-2 py-0.5 text-xs font-bold text-black/40"
      >
        {{ version }}
      </div>
    </div>
    <div class="mt-1 line-clamp-2 text-base text-black/60">
      {{ summary || title }}
    </div>
  </router-link>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  props: {
    date: String,
    title: String,
    summary: String,
    version: String,
    id: String,
  },
});
</script>
