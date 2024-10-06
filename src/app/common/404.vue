<template>
  <not-found />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import NotFound from "@/components/NotFound.vue";
import { defaultTitle } from "@/utils/utils";
import { useHead } from "@unhead/vue";

export default defineComponent({
  setup() {
    useHead({
      title: [defaultTitle, "404"].join(" / "),
    });
  },
  components: {
    NotFound,
  },
});
</script>
