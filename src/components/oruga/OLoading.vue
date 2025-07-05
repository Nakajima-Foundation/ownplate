<template>
  <div v-if="active" :class="wrapperClass" @click="close">
    <i class="fas fa-circle-notch fa-spin text-4xl text-white"></i>
  </div>
</template>
<script lang="ts">
import { defineComponent, computed } from 'vue';
export default defineComponent({
  name: 'OLoading',
  props: {
    active: Boolean,
    isFullPage: { type: Boolean, default: true },
    canCancel: Boolean,
  },
  emits: ['close'],
  setup(props, { emit, attrs }) {
    const close = () => props.canCancel && emit('close');
    const wrapperClass = computed(() => [
      props.isFullPage ? 'fixed' : 'absolute',
      'inset-0 flex items-center justify-center bg-black bg-opacity-25',
      attrs.class,
    ]);
    return { close, wrapperClass };
  },
});
</script>
