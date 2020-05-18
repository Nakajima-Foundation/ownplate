<template>
  <div>
    <b-loading :is-full-page="false" :active="isValidating"></b-loading>
  </div>
</template>

<script>
// https://firebase.googleblog.com/2016/11/authenticate-your-firebase-users-with-line-login.html
import { ownPlateConfig } from "@/config/project";
import { db, auth, firestore, functions } from "~/plugins/firebase.js";

export default {
  data() {
    return {
      isValidating: false
    };
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
          client_id: ownPlateConfig.line.LOGIN_CHANNEL_ID
        });
        console.log(data);
        if (data.nonce && data.profile) {
          if (this.becameFriend) {
            await db.doc(`users/${this.user.uid}/private/line`).set({
              isFriend: true
            });
          }
          this.$router.push(data.nonce);
        } else {
          console.error("validatin failed", data);
        }
      } catch (error) {
        console.error(error.message, error.details);
      } finally {
        this.isValidating = false;
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
    becameFriend() {
      return this.$route.query.friendship_status_changed;
    },
    redirect_uri() {
      return location.origin + "/callback/line";
    }
  }
};
</script>
