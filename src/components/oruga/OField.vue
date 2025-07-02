<template>
  <div v-bind="$attrs"><slot /></div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'OField',
});
</script>
