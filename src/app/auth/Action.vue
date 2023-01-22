<template>
  <div>
    <div v-if="mode == 'resetPassword'">
      <reset-password />
    </div>
    <div v-else-if="mode == 'verifyEmail'">
      <verify-email />
    </div>
    <div v-else>not found</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";

import ResetPassword from "./Actions/ResetPassword.vue";
import VerifyEmail from "./Actions/VerifyEmail.vue";

import { useRoute } from "vue-router";

export default defineComponent({
  name: "AccountAction",
  components: {
    ResetPassword,
    VerifyEmail,
  },
  setup() {
    const route = useRoute();

    const mode = computed(() => {
      return route.query.mode;
    });
    return { mode };
  },
});
</script>
