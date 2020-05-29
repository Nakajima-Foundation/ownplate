<template>
  <section class="section">
    <h1>{{ $t('line.authenticating')}}</h1>
    <b-loading :is-full-page="false" :active="isProcessing" :can-cancel="true"></b-loading>
  </section>
</template>

<script>
import { ownPlateConfig } from "@/config/project";
import { db, auth, firestore, functions } from "~/plugins/firebase.js";
export default {
  data() {
    return {
      isProcessing: false
    };
  },
  computed: {
    code() {
      return this.$route.query.code;
    },
    error() {
      if (this.$route.query.error) {
        return {
          code: this.$route.query.error,
          message: this.$route.query.error_description
        };
      }
      return null;
    },
    redirect_uri() {
      return location.origin + "/callback/track";
    }
  },
  async mounted() {
    console.log(this.$route.query);
    if (this.code) {
      const lineAuthenticate = functions.httpsCallable("lineAuthenticate");
      try {
        this.isProcessing = true;
        const { data } = await lineAuthenticate({
          code: this.code,
          redirect_uri: this.redirect_uri,
          client_id: ownPlateConfig.line.TRACK_CHANNEL_ID
        });
        console.log(data);
        if (data.nonce && data.profile && data.customToken) {
          console.log("validation succeded");
          const user = await auth.signInWithCustomToken(data.customToken);
          console.log("signInWithCustomToken", user);
          const lineSetCustomClaim = functions.httpsCallable(
            "lineSetCustomClaim"
          );
          const result = await lineSetCustomClaim();
          console.log("result", result);
          if (user) {
            this.$router.replace(`/t/${data.nonce}`);
          }
        } else {
          console.error("validatin failed", data);
          throw new Error("something is wrong");
        }
      } catch (error) {
        console.error(error.message, error.details);
        this.$store.commit("setErrorMessage", {
          code: "line.validation",
          message2: "errorPage.message.line",
          error
        });
      } finally {
        this.isProcessing = false;
      }
    } else if (this.error) {
      console.error(this.error);
      this.$store.commit("setErrorMessage", {
        message: this.error.message,
        message2: "errorPage.message.line",
        error: this.error
      });
    }
  }
};
</script>
