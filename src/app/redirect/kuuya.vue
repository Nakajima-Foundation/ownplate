<template>
  <div>Redirecting...</div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useBasePath } from "@/utils/utils";
const router = useRouter();
const basePath = useBasePath();
router.push(basePath.value + "/r/5OInKqrhlpe7LHYNYXuU");
</script>
