<template>
  <div v-if="active" class="fixed inset-0 z-40 flex">
    <div class="flex-1 bg-black/30"></div>
  </div>
  <transition name="slide">
    <div v-if="active" class="fixed inset-0 z-40 flex" @click="close">
      <div class="h-full w-64 overflow-y-auto bg-white shadow" @click.stop>
        <slot />
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
defineProps<{ active: boolean }>();
const emit = defineEmits<{
  (e: "update:active", value: boolean): void;
}>();

const close = () => emit("update:active", false);
</script>

<style scoped>
.slide-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}
.slide-enter-to {
  transform: translateX(0%);
  opacity: 1;
}
.slide-enter-active,
.slide-leave-active {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}
.slide-leave-from {
  transform: translateX(0%);
  opacity: 1;
}
.slide-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
</style>
