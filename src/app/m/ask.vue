<template>
	<div>Redirecting...</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { defaultTitle } from "@/utils/utils";
import { useHead } from "@unhead/vue";

export default defineComponent({
  setup() {
    useHead({
      title: [defaultTitle, "Redirect"].join(" / "),
    });
  },
  mounted() {
    window.location.href = "https://docs.google.com/forms/d/e/1FAIpQLSfGR4kk65ynfkCRGJsvJz01HZf7AU1nGLL9Rn9i4G9-qiW6MQ/viewform";
  }
});
</script>
