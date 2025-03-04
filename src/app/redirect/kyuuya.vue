<template>
  <div>Redirecting...</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  setup() {
    const currentOrigin = window.location.origin;
    window.location.href = `${currentOrigin}/r/5OInKqrhlpe7LHYNYXuU`;
  },
});
</script>
