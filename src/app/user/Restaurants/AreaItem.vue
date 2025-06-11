<template>
  <router-link :to="'/r/area/' + id">
    <div class="flex rounded-lg bg-white p-4 shadow-sm">
      <div class="text-base text-black">{{ name }}</div>
      <div class="flex-1 text-right text-sm text-black/40">
        {{ amount }}
      </div>
    </div>
  </router-link>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    name: String,
    amount: String,
    id: String,
  },
});
</script>
