<template>
  <div v-if="active" class="fixed inset-0 z-40 flex">
    <div class="flex-1 bg-black/30"></div>
  </div>
  <transition
    enter-from-class="-translate-x-full opacity-0"
    enter-to-class="translate-x-0 opacity-100"
    enter-active-class="transition duration-300 ease-in-out"
    leave-from-class="translate-x-0 opacity-100"
    leave-to-class="-translate-x-full opacity-0"
    leave-active-class="transition duration-300 ease-in-out"
  >
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
