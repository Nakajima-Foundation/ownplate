<template>
  <div>
    <div v-if="mode == 'resetPassword'">
      <reset-password />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "@vue/composition-api";

import ResetPassword from "./Actions/ResetPassword.vue";

export default defineComponent({
  name: "AccountAction",
  components: {
    ResetPassword,
  },
  setup(_, ctx) {
    const mode = computed(() => {
      return ctx.root.$route.query.mode;
    });
    return { mode };
  },
});
</script>
