<template>
  <p>Hello Callback</p>
</template>

<script>
// https://firebase.googleblog.com/2016/11/authenticate-your-firebase-users-with-line-login.html
import { ownPlateConfig } from "@/config/project";
import { db, auth, firestore, functions } from "~/plugins/firebase.js";

export default {
  async mounted() {
    console.log(this.user);
    if (this.code) {
      console.log("****", this.code);
      const lineValidate = functions.httpsCallable("lineValidate");
      try {
        const { data } = await lineValidate({
          code: this.code,
          redirect_uri: this.redirect_uri,
          client_id: ownPlateConfig.LINE_CHANNEL_ID
        });
        console.log(data);
        this.$router.push(data.nonce);
      } catch (error) {
        console.error(error.message, error.details);
      }
    }
  },
  computed: {
    user() {
      return this.$store.state.user;
    },
    code() {
      return this.$route.query.code;
    },
    redirect_uri() {
      return location.origin + "/callback/line";
    }
  }
};
</script>
