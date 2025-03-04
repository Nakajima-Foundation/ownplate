<template>
  <div>Redirecting...</div>
</template>

<script setup lang="ts">
	const currentOrigin = window.location.origin;
	window.location.href = `${currentOrigin}?utm_source=web&utm_medium=note&utm_campaign=note`;
</script>
