<template>
  <div
    v-if="active"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    @click.self="close"
  >
    <div :style="{ width: width || 'auto' }" class="w-full max-w-md">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

defineProps<{ active: boolean; width: number }>();
const emit = defineEmits<{ (e: "dismissed"): void }>();

const close = () => emit("dismissed");
</script>
