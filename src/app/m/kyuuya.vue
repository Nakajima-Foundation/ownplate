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
		const currentOrigin = window.location.origin
		window.location.href = `${currentOrigin}/r/5OInKqrhlpe7LHYNYXuU`
  }
});
</script>
