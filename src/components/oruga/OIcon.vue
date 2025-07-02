<template>
  <i :class="classes" />
</template>
<script lang="ts">
import { defineComponent, computed } from 'vue';
export default defineComponent({
  name: 'OIcon',
  props: {
    icon: String,
    pack: String,
    spin: Boolean,
    customSize: String,
  },
  setup(props, { attrs }) {
    const classes = computed(() => [
      props.pack || 'fas',
      `fa-${props.icon}`,
      props.spin ? 'animate-spin' : '',
      props.customSize,
      attrs.class,
    ]);
    return { classes };
  },
});
</script>
