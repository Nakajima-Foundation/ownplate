<template>
  <section class="section">
    <h1>Line Test</h1>
    <a :href="lineAuth">Line Login</a>
  </section>
</template>

<script>
import { ownPlateConfig } from "@/config/project";

export default {
  mounted() {
    if (this.code) {
      console.log("****", this.code);
    }
  },
  computed: {
    code() {
      return this.$route.query.code;
    },
    lineAuth() {
      const query = {
        response_type: "code",
        client_id: ownPlateConfig.LINE_CHANNEL_ID,
        redirect_uri: location.origin + "/test/line",
        scope: "profile openid",
        state: "s" + Math.random()
        //nonce: "u" + Math.random()
      };
      const queryString = Object.keys(query)
        .map(key => {
          return key + "=" + encodeURIComponent(query[key]);
        })
        .join("&");
      return `https://access.line.me/oauth2/v2.1/authorize?${queryString}`;
    }
  }
};
</script>
