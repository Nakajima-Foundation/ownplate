<template>
  <div></div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { auth } from "@/lib/firebase/firebase9";
import { applyActionCode } from "firebase/auth";

import { useRoute } from "vue-router";

export default defineComponent({
  setup() {
    const route = useRoute();

    (async () => {
      try {
        await applyActionCode(
          auth,
          route.query.oobCode as string
        );
      } catch (e) {
        console.log(e);
        console.log("error");
      }
      location.replace("/admin/restaurants");
    })();
  },
});
</script>
