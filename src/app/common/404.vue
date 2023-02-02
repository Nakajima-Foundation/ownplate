<template>
  <not-found />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import NotFound from "@/components/NotFound.vue";

export default defineComponent({
  metaInfo() {
    return {
      title: [this.defaultTitle, "404"].join(" / "),
    };
  },
  components: {
    NotFound,
  },
});
</script>
