<template>
  <router-link :to="'/admin/news/' + id">
    <div class="rounded-lg bg-white px-4 py-2 shadow-sm">
      <div class="text-sm font-bold text-black text-opacity-30">{{ date }}</div>
      <div class="text-base text-black text-opacity-60">{{ title }}</div>
    </div>
  </router-link>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  props: {
    date: String,
    title: String,
    id: String,
  },
});
</script>
