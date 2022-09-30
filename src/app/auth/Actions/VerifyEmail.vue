<template>
  <div>verify</div>
</template>


<script lang="ts">
import { defineComponent } from "@vue/composition-api";
import { auth } from "@/lib/firebase/firebase9";
import { applyActionCode } from "firebase/auth";

export default defineComponent({
  setup(_, ctx) {
    (async () => {
      try {
        const res = await applyActionCode(auth, ctx.root.$route.query.oobCode as string);
        console.log(res);
      } catch (e) {
        console.log(e);
        console.log("error");
      }
      ctx.root.$router.push("/admin/restaurants");
    })();
  },
});
</script>

