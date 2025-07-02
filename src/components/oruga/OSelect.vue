<template>
  <select v-bind="$attrs" :value="modelValue" @change="onChange" class="border rounded px-2 py-1 w-full">
    <slot />
  </select>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'OSelect',
  props: { modelValue: [String, Number] },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const onChange = (e: Event) => emit('update:modelValue', (e.target as HTMLSelectElement).value);
    return { onChange };
  },
});
</script>
