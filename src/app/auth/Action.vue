<template>
  <div>
    <div v-if="mode == 'resetPassword'">
      <reset-password />
    </div>
    <div v-if="mode == 'verifyEmail'">
      <verify-email />
    </div>
    <div v-else>not found</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "@vue/composition-api";

import ResetPassword from "./Actions/ResetPassword.vue";
import VerifyEmail from "./Actions/VerifyEmail.vue";

export default defineComponent({
  name: "AccountAction",
  components: {
    ResetPassword,
    VerifyEmail,
  },
  setup(_, ctx) {
    const mode = computed(() => {
      return ctx.root.$route.query.mode;
    });
    return { mode };
  },
});
</script>
