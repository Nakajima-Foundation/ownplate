<template>
  <label v-bind="$attrs">
    <input type="radio" class="mr-2" :checked="isChecked" @change="onChange" />
    <slot />
  </label>
</template>
<script lang="ts">
import { defineComponent, computed } from 'vue';
export default defineComponent({
  name: 'ORadio',
  props: {
    modelValue: [String, Number, Boolean],
    value: [String, Number, Boolean],
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const onChange = () => emit('update:modelValue', props.value);
    const isChecked = computed(() => props.modelValue === props.value);
    return { onChange, isChecked };
  },
});
</script>
