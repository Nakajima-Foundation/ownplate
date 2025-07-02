<template>
  <div v-if="active" class="fixed inset-0 z-40 flex" @click="close">
    <div class="bg-white shadow w-64 h-full overflow-y-auto" @click.stop>
      <slot />
    </div>
    <div class="flex-1 bg-black bg-opacity-30"></div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'OSidebar',
  props: { active: Boolean },
  emits: ['update:active'],
  setup(props, { emit }) {
    const close = () => emit('update:active', false);
    return { close };
  },
});
</script>
