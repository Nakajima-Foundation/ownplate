<template>
  <section class="section">
    <p>Track Callback</p>
    <a href="/test/track">Track</a>
  </section>
</template>

<script>
import { ownPlateConfig } from "@/config/project";
import { db, auth, firestore, functions } from "~/plugins/firebase.js";
export default {
  computed: {
    code() {
      return this.$route.query.code;
    },
    redirect_uri() {
      return location.origin + "/callback/track";
    }
  },
  async mounted() {
    console.log(this.$route.query);
    if (this.code) {
      const lineValidate = functions.httpsCallable("lineValidate");
      try {
        this.isValidating = true;
        const { data } = await lineValidate({
          code: this.code,
          redirect_uri: this.redirect_uri,
          client_id: ownPlateConfig.line.TRACK_CHANNEL_ID
        });
        console.log(data);
        if (data.nonce && data.profile && data.customToken) {
          console.log("validation succeded");
          const user = await auth.signInWithCustomToken(data.customToken);
          console.log("signInWithCustomToken", user);
          if (user) {
            this.$router.replace(`/t/${data.nonce}`);
          }
        } else {
          console.error("validatin failed", data);
        }
      } catch (error) {
        console.error(error.message, error.details);
        this.$store.commit("setErrorMessage", {
          code: "line.validation",
          message2: "errorPage.message.line",
          error
        });
      } finally {
        this.isValidating = false;
      }
    }
  }
};
</script>
