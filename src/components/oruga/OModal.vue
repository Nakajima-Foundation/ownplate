<template>
  <div v-if="isActive" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" @click="handleBackdrop">
    <div :style="{ width: width || 'auto' }" class="bg-white rounded shadow p-2">
      <slot />
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, computed } from 'vue';
export default defineComponent({
  name: 'OModal',
  props: {
    active: Boolean,
    width: String,
    modelValue: Boolean,
  },
  emits: ['update:active', 'close'],
  setup(props, { emit }) {
    const isActive = computed(() => props.active ?? props.modelValue);
    const close = () => {
      emit('update:active', false);
      emit('close');
    };
    const handleBackdrop = (e: Event) => {
      if (e.target === e.currentTarget) close();
    };
    return { isActive, width: props.width, handleBackdrop };
  },
});
</script>
