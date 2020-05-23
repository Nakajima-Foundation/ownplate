<template>
  <section class="section">
    <h1>Track</h1>
    <div>
      <a :href="lineAuth">Enter</a>
    </div>
    <div>
      <a href="foo">Leave</a>
    </div>
  </section>
</template>

<script>
import { ownPlateConfig } from "@/config/project";
export default {
  computed: {
    lineAuth() {
      const query = {
        response_type: "code",
        client_id: ownPlateConfig.line.TRACK_CHANNEL_ID,
        redirect_uri: this.redirect_uri,
        scope: "profile openid",
        state: "s" + Math.random(), // LATER: Make it more secure
        nonce: "restaurant ID" // HACK: Repurposing nonce
      };
      const queryString = Object.keys(query)
        .map(key => {
          return key + "=" + encodeURIComponent(query[key]);
        })
        .join("&");
      return `https://access.line.me/oauth2/v2.1/authorize?${queryString}`;
    },
    redirect_uri() {
      return location.origin + "/callback/track";
    }
  }
};
</script>
