<template>
	<div>Redirecting...</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  setup() {
    const currentOrigin = window.location.origin;
    window.location.href = `${currentOrigin}?utm_source=web&utm_medium=note&utm_campaign=note`;
  },
});
</script>
