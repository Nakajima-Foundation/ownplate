<template>
  <input v-bind="$attrs" :value="modelValue" @input="onInput" class="border rounded px-2 py-1 w-full" />
</template>
<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'OInput',
  props: { modelValue: [String, Number] },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const onInput = (e: Event) => emit('update:modelValue', (e.target as HTMLInputElement).value);
    return { onInput };
  },
});
</script>
