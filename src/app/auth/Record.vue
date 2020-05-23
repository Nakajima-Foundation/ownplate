<template>
  <section class="section">
    <p>Record</p>
  </section>
</template>

<script>
import { ownPlateConfig } from "@/config/project";
export default {
  mounted() {
    console.log("user =", this.user, this.isLineUser);
    if (this.isLineUser) {
      console.log("line user");
    } else {
      location.href = this.lineAuth;
    }
  },
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
    },
    isLineUser() {
      return this.user && this.user.uid.slice(0, 5) === "line:";
    },
    user() {
      return this.$store.state.user;
    }
  }
};
</script>

