<template>
  <not-found />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import NotFound from "@/components/NotFound.vue";
import { defaultTitle } from "@/utils/utils";

export default defineComponent({
  metaInfo() {
    return {
      title: [defaultTitle, "404"].join(" / "),
    };
  },
  components: {
    NotFound,
  },
});
</script>
