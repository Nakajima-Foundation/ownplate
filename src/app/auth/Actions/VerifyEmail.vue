<template>
  <div></div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { auth } from "@/lib/firebase/firebase9";
import { applyActionCode } from "firebase/auth";

export default defineComponent({
  setup(_, ctx) {
    (async () => {
      try {
        const res = await applyActionCode(
          auth,
          ctx.root.$route.query.oobCode as string
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
