<template>
  <div>
    <h1>{{ $t('line.authenticating')}}</h1>
    <b-loading :is-full-page="false" :active="isValidating"></b-loading>
  </div>
</template>

<script>
// https://firebase.googleblog.com/2016/11/authenticate-your-firebase-users-with-line-login.html
import { ownPlateConfig } from "@/config/project";
import { db, auth, firestore, functions } from "~/plugins/firebase.js";
import * as Cookie from "cookie";

export default {
  data() {
    return {
      isValidating: false
    };
  },
  async mounted() {
    console.log(this.$route.query);
    console.log("cookies", Cookie.parse(document.cookie));

    if (this.code) {
      try {
        const lineValidate = functions.httpsCallable("lineValidate");
        this.isValidating = true;
        const { data } = await lineValidate({
          code: this.code,
          redirect_uri: this.redirect_uri,
          client_id: ownPlateConfig.line.LOGIN_CHANNEL_ID
        });
        console.log(data);

        if (data.nonce && data.profile) {
          const params = this.lineGuard();
          console.log("*** params", params);

          this.user.getIdTokenResult(true).then(result => {
            this.$store.commit("setCustomClaims", result.claims);
            console.log("isLineuser", this.isLineUser);
            if (this.isLineUser) {
              // End-user case
              this.$router.push(params.pathname);
            } else {
              // Restaurant operator case
              this.$router.push(
                `${params.pathname}?userId=${
                  data.profile.userId
                }&displayName=${encodeURIComponent(data.profile.displayName)}`
              );
            }
          });
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
        this.isValidating = false;
      }
    }
  },
  computed: {
    code() {
      return this.$route.query.code;
    },
    redirect_uri() {
      return location.origin + "/callback/line";
    }
  }
};
</script>
