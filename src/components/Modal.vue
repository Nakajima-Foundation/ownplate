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
    <div
      :style="{ width: width || 'auto' }"
      class="w-full max-w-md max-h-[80vh] overflow-y-auto bg-white rounded-lg"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from "vue";
const props = defineProps<{ active: boolean; width: string }>();
const emit = defineEmits<{
  (e: "update:active", value: boolean): void;
  (e: "dismissed"): void;
}>();

const close = () => {
  emit("update:active", false);
  emit("dismissed");
};

watch(
  () => props.active,
  (val) => {
    document.body.style.overflow = val ? "hidden" : "";
  },
);
</script>
