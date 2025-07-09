<template>
  <button v-bind="$attrs" :disabled="disabled" @click="onClick"><slot /></button>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'OButton',
  props: { disabled: Boolean },
  emits: ['click'],
  setup(props, { emit }) {
    const onClick = (e: Event) => emit('click', e);
    return { onClick };
  },
});
</script>
