<template>
  <label v-bind="$attrs">
    <input type="checkbox" class="mr-2" :checked="modelValue" @change="onChange" />
    <slot />
  </label>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'OCheckbox',
  props: { modelValue: Boolean },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const onChange = (e: Event) => emit('update:modelValue', (e.target as HTMLInputElement).checked);
    return { onChange };
  },
});
</script>
