<template>
  <div>
    <a :href="authUrl">連携する</a>
  </div>
</template>

<script>
import { smaregi } from "@/config/project";

export default {
  name: "Restaurant",
  data() {
    return {
      authUrl: `${smaregi.authUrl}?response_type=code&client_id=${smaregi.clientId}&scope=openid+email+offline_access`,
    };
  },
};
</script>
