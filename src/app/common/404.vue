<template>
  <not-found />
</template>

<script>
import NotFound from "@/components/NotFound";
export default {
  head() {
    return {
      title: [this.defaultTitle, "404"].join(" / ")
    }
  },
  components: {
    NotFound
  },
};
</script>
