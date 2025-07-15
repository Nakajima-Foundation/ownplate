<template>
  <div
    v-if="active"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    @click.self="close"
    @keydown.esc="close"
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <div :style="{ width: width || 'auto' }" class="w-full max-w-md">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ active: boolean; width: string }>();
const emit = defineEmits<{ (e: "close"): void }>();

const close = () => emit("dismissed");
</script>
