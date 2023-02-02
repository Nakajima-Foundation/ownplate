<template>
  <div>
    <div class="mt-6 text-center text-xl font-bold text-black text-opacity-40">
      {{ $t("line.authenticating") }}
    </div>
    <o-loading :is-full-page="false" :active="isValidating"></o-loading>
  </div>
</template>

<script>
// https://firebase.googleblog.com/2016/11/authenticate-your-firebase-users-with-line-login.html
import { ownPlateConfig } from "@/config/project";
import { lineGuard } from "@/lib/line/line";
import { lineValidate } from "@/lib/firebase/functions";

export default {
  data() {
    return {
      isValidating: false,
    };
  },
  async mounted() {
    if (this.code) {
      try {
        this.isValidating = true;
        const { data } = await lineValidate({
          code: this.code,
          redirect_uri: this.redirect_uri,
        });
        console.log("lineValidate", data);

        if (data.nonce && data.profile) {
          const state = this.$route.query.state;
          const params = lineGuard(data.nonce, state);

          this.user.getIdTokenResult(true).then((result) => {
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
                }&displayName=${encodeURIComponent(
                  data.profile.displayName
                )}&state=${state}`
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
          error,
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
    },
  },
};
</script>
